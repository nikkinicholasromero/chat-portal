import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  inject, OnInit,
  ViewChild
} from "@angular/core";
import {Router} from "@angular/router";
import {ChatService} from "../../shared/service/chat.service";
import {NgIf} from "@angular/common";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn, Validators
} from "@angular/forms";
import {StateService} from "../../shared/service/state.service";
import {HeaderComponent} from "../../components/header.component";
import {AlertComponent} from "../../components/alert.component";

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    HeaderComponent,
    AlertComponent
  ],
  template: `
    <app-header></app-header>
    <div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
          <div class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all w-[480px] sm:my-8 sm:p-6">
            <div class="absolute left-0 top-0 pl-4 pt-4">
              <button type="button"
                      class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      (click)="back()">
                <span class="sr-only">Back</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                     stroke="currentColor" class="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/>
                </svg>
              </button>
            </div>
            <div class="mt-3 text-center sm:mt-5 space-y-4">
              <div class="sm:mx-auto sm:w-full sm:max-w-sm">
                <img class="h-8 w-auto m-auto" src="assets/logo.png" alt="Chat">
                <h2 class="mt-5 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Password Reset</h2>
              </div>
              <form class="space-y-3 text-left" [formGroup]="form" *ngIf="showForm">
                <div>
                  <label
                    for="password"
                    class="input-label"
                    [class.input-label-error]="password.touched && password.invalid">
                    New Password
                  </label>
                  <div>
                    <input
                      type="password"
                      class="input-field"
                      [class.input-field-error]="password.touched && password.invalid"
                      placeholder="Password"
                      id="password"
                      name="password"
                      formControlName="password"
                      #passwordElement>
                  </div>
                  <p class="text-rose-500 text-sm" *ngIf="password.touched && password.errors?.['required']">
                    Password is required
                  </p>
                  <p class="text-rose-500 text-sm" *ngIf="password.touched && password.errors?.['minlength']">
                    Password must be at least 8 characters long
                  </p>
                </div>

                <div>
                  <label
                    for="confirmPassword"
                    class="input-label"
                    [class.input-label-error]="confirmPassword.touched && (confirmPassword.invalid || form.errors?.['passwordsDoesNotMatch'])">
                    Confirm password
                  </label>
                  <div>
                    <input
                      type="password"
                      class="input-field"
                      [class.input-field-error]="confirmPassword.touched && (confirmPassword.invalid || form.errors?.['passwordsDoesNotMatch'])"
                      placeholder="Confirm password"
                      id="confirmPassword"
                      name="confirmPassword"
                      formControlName="confirmPassword">
                  </div>
                  <p class="text-rose-500 text-sm" *ngIf="confirmPassword.touched && confirmPassword.errors?.['required']">
                    Password is required
                  </p>
                  <p class="text-rose-500 text-sm" *ngIf="confirmPassword.touched && confirmPassword.errors?.['minlength']">
                    Password must be at least 8 characters long
                  </p>
                  <p class="text-rose-500 text-sm" *ngIf="confirmPassword.touched && !confirmPassword.errors?.['required'] && !confirmPassword.errors?.['minlength'] && form.errors?.['passwordsDoesNotMatch']">
                    Passwords does not match
                  </p>
                </div>
              </form>

              <div>
                <app-alert [message]="message" [messageType]="messageType" *ngIf="message != ''"></app-alert>
              </div>

              <button type="button"
                      class="btn-primary"
                      *ngIf="showButton"
                      (click)="buttonAction()"
                      [class.btn-disabled]="!buttonEnabled"
                      [disabled]="!buttonEnabled">
                {{ buttonLabel }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PasswordResetComponent implements OnInit {
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private chatService = inject(ChatService);
  private stateService = inject(StateService);
  private changeDetector = inject(ChangeDetectorRef);

  private email = "";
  private passwordResetCode = "";

  messageType: "" | "SUCCESS" | "DANGER" | "WARNING" | "SECONDARY" = "";
  message = "";
  showForm = false;
  showButton = false;
  buttonAction = () => {
  };
  buttonLabel = "";
  buttonEnabled = false;
  form!: FormGroup;

  @ViewChild("passwordElement")
  private passwordElement!: ElementRef;

  constructor() {
    const passwordValidator: ValidatorFn = (
      control: AbstractControl
    ): ValidationErrors | null => {
      const password = control.get("password");
      const confirmPassword = control.get("confirmPassword");
      const hasError: boolean = !!password && !!confirmPassword && password.value !== confirmPassword.value;

      return hasError ? {passwordsDoesNotMatch: true} : null;
    };

    this.form = this.formBuilder.nonNullable.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]]
    }, {
      validators: [passwordValidator]
    });

    this.form.valueChanges.subscribe(() => {
      this.setMessage("", "");

      this.buttonEnabled =
        this.password.valid &&
        this.confirmPassword.valid &&
        this.password.value == this.confirmPassword.value;
    });
  }

  ngOnInit() {
    const parsedUrl = this.router.parseUrl(this.router.url);
    this.email = parsedUrl.queryParams["e"] ? decodeURIComponent(parsedUrl.queryParams["e"]) : "";
    this.passwordResetCode = parsedUrl.queryParams["c"] ? decodeURIComponent(parsedUrl.queryParams["c"]) : "";

    if (!this.email || !this.passwordResetCode) {
      this.setMessage("DANGER", "Password reset failed. Something went wrong. Please try again later");
      this.showForm = false;
      this.showButton = true;
      this.buttonAction = () => {
        window.location.reload();
      };
      this.buttonLabel = "Retry";
      this.buttonEnabled = true;
    } else {
      this.setMessage("", "");
      this.showForm = true;
      this.showButton = true;
      this.buttonAction = () => {
        this.resetPassword();
      };
      this.buttonLabel = "Reset Password";
      this.buttonEnabled = false;
      this.changeDetector.detectChanges();
      this.passwordElement.nativeElement.focus();
    }
  }

  @HostListener('document:keydown.enter')
  enterKeyPressedHandler() {
    if (this.stateService.loading()) {
      return;
    }

    this.buttonAction();
  }

  private resetPassword() {
    if (this.password.invalid || this.confirmPassword.invalid) {
      return;
    }
    this.stateService.setLoading(true);
    this.chatService.resetPassword({
      email: this.email,
      passwordResetCode: this.passwordResetCode,
      newPassword: this.password.value
    }).subscribe({
      next: () => {
        this.setMessage("SUCCESS", "Password reset successful. You may now login to your account");
        this.showForm = false;
        this.showButton = true;
        this.buttonAction = () => {
          this.router.navigate(['/'], {queryParams: {e: this.email}}).then();
        };
        this.buttonLabel = "Back";
        this.buttonEnabled = true;
        this.stateService.setLoading(false);
      },
      error: () => {
        this.setMessage("DANGER", "Something went wrong. Please try again later");
        this.stateService.setLoading(false);
      }
    });
  }

  back() {
    this.router.navigate(['/']).then();
  }

  private setMessage(
    messageType: "" | "SUCCESS" | "DANGER" | "WARNING" | "SECONDARY",
    message: string
  ) {
    this.messageType = messageType;
    this.message = message;
  }

  get password(): AbstractControl {
    return this.form.controls['password'];
  }

  get confirmPassword(): AbstractControl {
    return this.form.controls['confirmPassword'];
  }
}
