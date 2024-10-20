import {
  AfterViewInit, ChangeDetectorRef,
  Component,
  effect,
  ElementRef,
  HostListener,
  inject, Input,
  output,
  signal,
  ViewChild
} from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import {AuthenticationService} from "../security/authentication.service";
import {EmailStatus} from "../security/email-status.type";
import {NgIf} from "@angular/common";
import {ChatService} from "../shared/service/chat.service";
import {StateService} from "../shared/service/state.service";
import {AlertComponent} from "./alert.component";
import {environment} from "../../environments/environment";

enum State {
  INITIAL,
  UNREGISTERED,
  REGISTRATION_SUCCESSFUL,
  UNCONFIRMED,
  CONFIRMATION_RESENT,
  CONFIRMED,
  FORGOT_PASSWORD,
  PASSWORD_RESET_CODE_SENT
}

@Component({
  selector: 'app-login-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    AlertComponent
  ],
  template: `
    <div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
          <div class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all w-[480px] sm:my-8 sm:p-6" #modalElement>
            <div class="absolute left-0 top-0 pl-4 pt-4">
              <button type="button"
                      class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      (click)="back()"
                      *ngIf="state() != State.INITIAL">
                <span class="sr-only">Back</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                     stroke="currentColor" class="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/>
                </svg>
              </button>
            </div>
            <div class="absolute right-0 top-0 pr-4 pt-4">
              <button type="button"
                      class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      (click)="closesModal.emit(true)">
                <span class="sr-only">Close</span>
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                     aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="mt-3 text-center sm:mt-5 space-y-4">
              <div class="sm:mx-auto sm:w-full sm:max-w-sm">
                <img class="h-8 w-auto m-auto" src="assets/logo.png" alt="Chat">
                <h2 class="mt-5 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">{{ header }}</h2>
              </div>
              <form class="space-y-3 text-left" [formGroup]="form">
                <div *ngIf="state() != State.REGISTRATION_SUCCESSFUL">
                  <label for="email" class="input-label">Email address</label>
                  <div>
                    <input
                      type="email"
                      class="input-field"
                      placeholder="Email address"
                      autocomplete="email"
                      id="email"
                      name="email"
                      formControlName="email"
                      maxlength="320"
                      #emailElement>
                  </div>
                </div>
                <div *ngIf="state() == State.CONFIRMED">
                  <label for="password" class="input-label">Password</label>
                  <div>
                    <input
                      type="password"
                      class="input-field"
                      placeholder="Password"
                      autocomplete="current-password"
                      id="password"
                      name="password"
                      formControlName="password"
                      #passwordElement>
                  </div>
                  <div class="text-sm mt-1">
                    <a href="javascript:void(0)" class="font-semibold text-blue-600 hover:text-blue-500"
                       (click)="forgotPassword()">Forgot password?</a>
                  </div>
                </div>
                <ng-container *ngIf="state() == State.UNREGISTERED">
                  <div>
                    <label
                      for="firstName"
                      class="input-label input-label-required"
                      [class.input-label-error]="firstName.touched && firstName.invalid">
                      First name
                    </label>
                    <div>
                      <input
                        type="text"
                        class="input-field"
                        [class.input-field-error]="firstName.touched && firstName.invalid"
                        placeholder="First name"
                        autocomplete="given-name"
                        id="firstName"
                        name="firstName"
                        formControlName="firstName"
                        maxlength="100"
                        #firstNameElement>
                    </div>
                    <p class="text-rose-500 text-sm" *ngIf="firstName.touched && firstName.errors?.['required']">
                      First name is required
                    </p>
                    <p class="text-rose-500 text-sm" *ngIf="firstName.touched && firstName.errors?.['maxlength']">
                      Should not exceed 100 characters
                    </p>
                  </div>
                  <div>
                    <label
                      for="lastName"
                      class="input-label input-label-required"
                      [class.input-label-error]="lastName.touched && lastName.invalid">
                      Last name
                    </label>
                    <div>
                      <input
                        type="text"
                        class="input-field"
                        [class.input-field-error]="lastName.touched && lastName.invalid"
                        placeholder="Last name"
                        autocomplete="family-name"
                        id="lastName"
                        name="lastName"
                        formControlName="lastName"
                        maxlength="100">
                    </div>
                    <p class="text-rose-500 text-sm" *ngIf="lastName.touched && lastName.errors?.['required']">
                      Last name is required
                    </p>
                    <p class="text-rose-500 text-sm" *ngIf="lastName.touched && lastName.errors?.['maxlength']">
                      Should not exceed 100 characters
                    </p>
                  </div>
                  <div>
                    <label
                      for="registrationPassword"
                      class="input-label input-label-required"
                      [class.input-label-error]="registrationPassword.touched && registrationPassword.invalid">
                      Password
                    </label>
                    <div>
                      <input
                        type="password"
                        class="input-field"
                        [class.input-field-error]="registrationPassword.touched && registrationPassword.invalid"
                        placeholder="Password"
                        id="registrationPassword"
                        name="registrationPassword"
                        formControlName="registrationPassword">
                    </div>
                    <p class="text-rose-500 text-sm" *ngIf="registrationPassword.touched && registrationPassword.errors?.['required']">
                      Password is required
                    </p>
                    <p class="text-rose-500 text-sm" *ngIf="registrationPassword.touched && registrationPassword.errors?.['minlength']">
                      Password must be at least 8 characters long
                    </p>
                  </div>
                  <div>
                    <label
                      for="registrationConfirmPassword"
                      class="input-label input-label-required"
                      [class.input-label-error]="registrationConfirmPassword.touched && (registrationConfirmPassword.invalid || form.errors?.['passwordsDoesNotMatch'])">
                      Confirm password
                    </label>
                    <div>
                      <input
                        type="password"
                        class="input-field"
                        [class.input-field-error]="registrationConfirmPassword.touched && (registrationConfirmPassword.invalid || form.errors?.['passwordsDoesNotMatch'])"
                        placeholder="Confirm password"
                        id="registrationConfirmPassword"
                        name="registrationConfirmPassword"
                        formControlName="registrationConfirmPassword">
                    </div>
                    <p class="text-rose-500 text-sm" *ngIf="registrationConfirmPassword.touched && registrationConfirmPassword.errors?.['required']">
                      Password is required
                    </p>
                    <p class="text-rose-500 text-sm" *ngIf="registrationConfirmPassword.touched && registrationConfirmPassword.errors?.['minlength']">
                      Password must be at least 8 characters long
                    </p>
                    <p class="text-rose-500 text-sm" *ngIf="registrationConfirmPassword.touched && !registrationConfirmPassword.errors?.['required'] && !registrationConfirmPassword.errors?.['minlength'] && form.errors?.['passwordsDoesNotMatch']">
                      Passwords does not match
                    </p>
                  </div>
                </ng-container>

                <div>
                  <app-alert [message]="message" [messageType]="messageType" *ngIf="message != ''"></app-alert>
                </div>

                <button
                  type="button"
                  class="btn-primary"
                  (click)="next()"
                  [class.btn-disabled]="!nextButtonEnabled"
                  [disabled]="!nextButtonEnabled">
                  {{ nextButtonLabel }}
                </button>
                <ng-container *ngIf="state() == State.INITIAL">
                  <div class="text-center space-y-2">
                    <hr>
                    <p class="text-sm">or continue with</p>
                    <a class="btn-default" [href]="environment.googleAuthUri">
                      <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 48 48" class="mx-2">
                        <path fill="#FFC107"
                              d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                        <path fill="#FF3D00"
                              d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                        <path fill="#4CAF50"
                              d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                        <path fill="#1976D2"
                              d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                      </svg>
                      Google
                    </a>
                    <a class="btn-default" [href]="environment.facebookAuthUri">
                      <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 48 48" class="mx-2">
                        <path fill="#039be5" d="M24 5A19 19 0 1 0 24 43A19 19 0 1 0 24 5Z"></path>
                        <path fill="#fff"
                              d="M26.572,29.036h4.917l0.772-4.995h-5.69v-2.73c0-2.075,0.678-3.915,2.619-3.915h3.119v-4.359c-0.548-0.074-1.707-0.236-3.897-0.236c-4.573,0-7.254,2.415-7.254,7.917v3.323h-4.701v4.995h4.701v13.729C22.089,42.905,23.032,43,24,43c0.875,0,1.729-0.08,2.572-0.194V29.036z"></path>
                      </svg>
                      Facebook
                    </a>
                    <a class="btn-default" [href]="environment.microsoftAuthUri">
                      <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 48 48" class="mx-2">
                        <path fill="#ff5722" d="M6 6H22V22H6z" transform="rotate(-180 14 14)"></path>
                        <path fill="#4caf50" d="M26 6H42V22H26z" transform="rotate(-180 34 14)"></path>
                        <path fill="#ffc107" d="M26 26H42V42H26z" transform="rotate(-180 34 34)"></path>
                        <path fill="#03a9f4" d="M6 26H22V42H6z" transform="rotate(-180 14 34)"></path>
                      </svg>
                      Microsoft
                    </a>
                  </div>
                </ng-container>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginDialogComponent implements AfterViewInit {
  protected readonly State = State;
  protected readonly environment = environment;

  private authenticationService = inject(AuthenticationService);
  private formBuilder = inject(FormBuilder);
  private changeDetector = inject(ChangeDetectorRef);
  private chatService = inject(ChatService);
  private stateService = inject(StateService);

  @ViewChild("modalElement")
  private modal!: ElementRef;

  @ViewChild("emailElement")
  private emailElement!: ElementRef;

  @ViewChild("firstNameElement")
  private firstNameElement!: ElementRef;

  @ViewChild("passwordElement")
  private passwordElement!: ElementRef;

  closesModal = output<boolean>();
  @Input({required: true})
  initialEmail!: string;

  state = signal(State.INITIAL);
  header = "";
  messageType: "" | "SUCCESS" | "DANGER" | "WARNING" | "SECONDARY" = "";
  message = "";
  next = () => {
  };
  nextButtonEnabled = false;
  nextButtonLabel = "";
  form!: FormGroup;

  constructor() {
    effect(() => {
      if (this.stateService.authenticated()) {
        this.closesModal.emit(true);
      }
    });

    const passwordValidator: ValidatorFn = (
      control: AbstractControl
    ): ValidationErrors | null => {
      const password = control.get("registrationPassword");
      const confirmPassword = control.get("registrationConfirmPassword");
      const hasError: boolean = !!password && !!confirmPassword && password.value !== confirmPassword.value;

      return hasError ? {passwordsDoesNotMatch: true} : null;
    };

    this.form = this.formBuilder.nonNullable.group({
      email: ['', [Validators.required, Validators.email, Validators.max(320)]],
      password: ['', [Validators.required]],
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      registrationPassword: ['', [Validators.required, Validators.minLength(8)]],
      registrationConfirmPassword: ['', [Validators.required, Validators.minLength(8)]]
    }, {
      validators: [passwordValidator]
    });

    this.form.valueChanges.subscribe(() => {
      this.setMessage("", "");

      const state = this.state();
      if (state == State.INITIAL) {
        this.nextButtonEnabled = this.email.valid;
      } else if (state == State.UNREGISTERED) {
        this.nextButtonEnabled =
          this.firstName.valid &&
          this.lastName.valid &&
          this.registrationPassword.valid &&
          this.registrationConfirmPassword.valid &&
          this.registrationPassword.value == this.registrationConfirmPassword.value;
      } else if (state == State.CONFIRMED) {
        this.nextButtonEnabled = this.password.valid;
      }
    });

    effect(() => {
      const state = this.state();
      if (state == State.INITIAL) {
        this.email.enable();
        this.password.reset();
        this.firstName.reset();
        this.lastName.reset();
        this.registrationPassword.reset();
        this.registrationConfirmPassword.reset();
        this.changeDetector.detectChanges();
        this.emailElement.nativeElement.focus();
        if (this.email.getRawValue() == "" && this.initialEmail != "") {
          this.email.setValue(this.initialEmail);
        }

        this.setComponentStatus(
          "Welcome",
          "",
          "",
          this.checkEmailStatus,
          this.email.valid,
          "Continue");
      } else if (state == State.UNREGISTERED) {
        this.email.disable();
        this.changeDetector.detectChanges();
        this.firstNameElement.nativeElement.focus();

        this.setComponentStatus(
          "Registration",
          "",
          "",
          this.register,
          this.firstName.valid &&
          this.lastName.valid &&
          this.registrationPassword.valid &&
          this.registrationConfirmPassword.valid &&
          this.registrationPassword.value == this.registrationConfirmPassword.value,
          "Register");
      } else if (state == State.REGISTRATION_SUCCESSFUL) {
        this.setComponentStatus(
          "Registration",
          "SUCCESS",
          "Registration successful. Please check your email for the account confirmation",
          this.back,
          true,
          "Back");
      } else if (state == State.UNCONFIRMED) {
        this.email.disable();

        this.setComponentStatus(
          "Registration",
          "WARNING",
          "Unconfirmed account. Please check your email for the account confirmation",
          this.resendConfirmation,
          true,
          "Resend Confirmation");
      } else if (state == State.CONFIRMATION_RESENT) {
        this.setComponentStatus(
          "Registration",
          "SUCCESS",
          "Confirmation resent. Please check your email for the account confirmation",
          this.back,
          true,
          "Back");
      } else if (state == State.CONFIRMED) {
        this.email.disable();
        this.changeDetector.detectChanges();
        this.passwordElement.nativeElement.focus();

        this.setComponentStatus(
          "Sign in",
          "",
          "",
          this.login,
          this.password.valid,
          "Sign in");
      } else if (state == State.FORGOT_PASSWORD) {
        this.email.disable();

        this.setComponentStatus(
          "Forgot Password",
          "SECONDARY",
          "Would you like us to send to a password reset email?",
          this.sendPasswordResetCode,
          true,
          "Send Reset Password Email");
      } else if (state == State.PASSWORD_RESET_CODE_SENT) {
        this.setComponentStatus(
          "Forgot Password",
          "SUCCESS",
          "Password reset link sent. Please check your email for further instructions",
          this.back,
          true,
          "Back");
      }
    });
  }

  private setComponentStatus(
    header: string,
    messageType: "" | "SUCCESS" | "DANGER" | "WARNING" | "SECONDARY",
    message: string,
    next: () => void,
    nextButtonEnabled: boolean,
    nextButtonLabel: string
  ) {
    this.header = header;
    this.setMessage(messageType, message);
    this.next = next;
    this.nextButtonEnabled = nextButtonEnabled;
    this.nextButtonLabel = nextButtonLabel;
  }

  ngAfterViewInit() {
    this.state.set(State.INITIAL);
  }

  @HostListener('document:keydown.escape')
  escapeKeyPressedHandler() {
    if (this.stateService.loading()) {
      return;
    }

    this.closesModal.emit(true);
  }

  @HostListener('document:mousedown', ['$event.target'])
  outsideClickHandler(eventTarget: EventTarget) {
    if (this.stateService.loading()) {
      return;
    }

    if (!this.modal.nativeElement.contains(eventTarget)) {
      this.closesModal.emit(true);
    }
  }

  @HostListener('document:keydown.enter')
  enterKeyPressedHandler() {
    if (this.stateService.loading()) {
      return;
    }

    this.next();
  }

  back() {
    this.state.set(State.INITIAL);
  }

  checkEmailStatus() {
    if (this.email.invalid) {
      return;
    }

    this.stateService.setLoading(true);
    this.chatService.getEmailStatus(this.email.getRawValue().toLowerCase()).subscribe({
      next: (response) => {
        if (response.status == EmailStatus.UNREGISTERED) {
          this.state.set(State.UNREGISTERED);
        } else if (response.status == EmailStatus.UNCONFIRMED) {
          this.state.set(State.UNCONFIRMED);
        } else if (response.status == EmailStatus.CONFIRMED) {
          this.state.set(State.CONFIRMED);
        }

        this.stateService.setLoading(false);
      },
      error: () => {
        this.setMessage("DANGER", "Something went wrong. Please try again later");
        this.stateService.setLoading(false);
      }
    });
  }

  register() {
    if (this.firstName.invalid ||
      this.lastName.invalid ||
      this.registrationPassword.invalid ||
      this.registrationConfirmPassword.invalid ||
      this.registrationPassword.value != this.registrationConfirmPassword.value) {
      return;
    }

    this.stateService.setLoading(true);
    this.chatService.registerUser({
      email: this.email.getRawValue().toLowerCase(),
      password: this.registrationPassword.value,
      firstName: this.firstName.value,
      lastName: this.lastName.value
    }).subscribe({
      next: () => {
        this.state.set(State.REGISTRATION_SUCCESSFUL);
        this.stateService.setLoading(false);
      },
      error: () => {
        this.setMessage("DANGER", "Registration failed. Please try again later");
        this.stateService.setLoading(false);
      }
    });
  }

  resendConfirmation() {
    this.stateService.setLoading(true);
    this.chatService.sendConfirmationCode(this.email.getRawValue().toLowerCase())
      .subscribe({
        next: () => {
          this.state.set(State.CONFIRMATION_RESENT);
          this.stateService.setLoading(false);
        },
        error: () => {
          this.setMessage("DANGER", "Something went wrong. Please try again later");
          this.stateService.setLoading(false);
        }
      });
  }

  login() {
    if (this.email.invalid || this.password.invalid) {
      return;
    }

    this.stateService.setLoading(true);
    this.authenticationService.authenticate(
      this.email.getRawValue().toLowerCase(),
      this.password.value,
      (data: any) => {
        if (data?.error?.error_codes?.includes("errors.credentials.incorrect")) {
          this.setMessage("DANGER", "Email and password did not match");
        } else {
          this.setMessage("DANGER", "Something went wrong. Please try again later");
        }
        this.stateService.setLoading(false);
      });
  }

  forgotPassword() {
    this.state.set(State.FORGOT_PASSWORD);
  }

  sendPasswordResetCode() {
    this.stateService.setLoading(true);
    this.chatService.sendPasswordResetCode(this.email.getRawValue())
      .subscribe({
        next: () => {
          this.state.set(State.PASSWORD_RESET_CODE_SENT);
          this.stateService.setLoading(false);
        },
        error: () => {
          this.setMessage("DANGER", "Something went wrong. Please try again later");
          this.stateService.setLoading(false);
        }
      });
  }

  private setMessage(
    messageType: "" | "SUCCESS" | "DANGER" | "WARNING" | "SECONDARY",
    message: string
  ) {
    this.messageType = messageType;
    this.message = message;
  }

  get email(): AbstractControl {
    return this.form.controls['email'];
  }

  get password(): AbstractControl {
    return this.form.controls['password'];
  }

  get firstName(): AbstractControl {
    return this.form.controls['firstName'];
  }

  get lastName(): AbstractControl {
    return this.form.controls['lastName'];
  }

  get registrationPassword(): AbstractControl {
    return this.form.controls['registrationPassword'];
  }

  get registrationConfirmPassword(): AbstractControl {
    return this.form.controls['registrationConfirmPassword'];
  }
}
