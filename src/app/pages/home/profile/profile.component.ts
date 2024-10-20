import {Component, inject, OnInit} from "@angular/core";
import {AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators} from "@angular/forms";
import {NgIf} from "@angular/common";
import {StateService} from "../../../shared/service/state.service";
import {ChatService} from "../../../shared/service/chat.service";
import {AlertComponent} from "../../../components/alert.component";
import {AuthenticationService} from "../../../security/authentication.service";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    AlertComponent
  ],
  template: `
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-12 p-6">
      <form [formGroup]="userProfileForm" class="space-y-6">
        <h2 class="text-base font-semibold leading-7 text-gray-900">Profile</h2>

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
          <app-alert [message]="updateProfileMessage" [messageType]="updateProfileMessageType" *ngIf="updateProfileMessage != ''"></app-alert>
        </div>

        <button type="button"
                class="btn-primary"
                [class.btn-disabled]="!saveChangesButtonEnabled"
                [disabled]="!saveChangesButtonEnabled"
                (click)="updateUserProfile()">
          Save Changes
        </button>
      </form>

      <hr class="sm:hidden">

      <form [formGroup]="passwordForm" class="space-y-6">
        <h2 class="text-base font-semibold leading-7 text-gray-900">Update Password</h2>

        <div *ngIf="!noPassword">
          <label
            for="currentPassword"
            class="input-label input-label-required"
            [class.input-label-error]="currentPassword.touched && currentPassword.invalid">
            Current password
          </label>
          <div>
            <input
              type="password"
              class="input-field"
              [class.input-field-error]="currentPassword.touched && currentPassword.invalid"
              placeholder="Current password"
              id="currentPassword"
              name="currentPassword"
              formControlName="currentPassword">
          </div>
          <p class="text-rose-500 text-sm" *ngIf="currentPassword.touched && currentPassword.errors?.['required']">
            Password is required
          </p>
        </div>

        <div>
          <label
            for="newPassword"
            class="input-label input-label-required"
            [class.input-label-error]="newPassword.touched && newPassword.invalid">
            New password
          </label>
          <div>
            <input
              type="password"
              class="input-field"
              [class.input-field-error]="newPassword.touched && newPassword.invalid"
              placeholder="New password"
              id="newPassword"
              name="newPassword"
              formControlName="newPassword">
          </div>
          <p class="text-rose-500 text-sm" *ngIf="newPassword.touched && newPassword.errors?.['required']">
            Password is required
          </p>
          <p class="text-rose-500 text-sm" *ngIf="newPassword.touched && newPassword.errors?.['minlength']">
            Password must be at least 8 characters long
          </p>
        </div>

        <div>
          <label
            for="confirmNewPassword"
            class="input-label input-label-required"
            [class.input-label-error]="confirmNewPassword.touched && (confirmNewPassword.invalid || passwordForm.errors?.['passwordsDoesNotMatch'])">
            Confirm new password
          </label>
          <div>
            <input
              type="password"
              class="input-field"
              [class.input-field-error]="confirmNewPassword.touched && (confirmNewPassword.invalid || passwordForm.errors?.['passwordsDoesNotMatch'])"
              placeholder="Confirm new password"
              id="confirmNewPassword"
              name="confirmNewPassword"
              formControlName="confirmNewPassword">
          </div>
          <p class="text-rose-500 text-sm" *ngIf="confirmNewPassword.touched && confirmNewPassword.errors?.['required']">
            Password is required
          </p>
          <p class="text-rose-500 text-sm" *ngIf="confirmNewPassword.touched && confirmNewPassword.errors?.['minlength']">
            Password must be at least 8 characters long
          </p>
          <p class="text-rose-500 text-sm" *ngIf="confirmNewPassword.touched && !confirmNewPassword.errors?.['required'] && !confirmNewPassword.errors?.['minlength'] && passwordForm.errors?.['passwordsDoesNotMatch']">
            Passwords does not match
          </p>
        </div>

        <div>
          <app-alert [message]="updatePasswordMessage" [messageType]="updatePasswordMessageType" *ngIf="updatePasswordMessage != ''"></app-alert>
        </div>

        <button type="button"
                class="btn-primary"
                [class.btn-disabled]="!updatePasswordButtonEnabled"
                [disabled]="!updatePasswordButtonEnabled"
                (click)="updatePassword()">
          Update Password
        </button>
      </form>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  formBuilder = inject(FormBuilder);
  chatService = inject(ChatService);
  stateService = inject(StateService);
  authenticationService = inject(AuthenticationService);

  userProfileForm!: FormGroup;
  passwordForm!: FormGroup;
  noPassword = false;

  updateProfileMessageType: "" | "SUCCESS" | "DANGER" | "WARNING" | "SECONDARY" = "";
  updateProfileMessage = "";
  updatePasswordMessageType: "" | "SUCCESS" | "DANGER" | "WARNING" | "SECONDARY" = "";
  updatePasswordMessage = "";

  saveChangesButtonEnabled = false;
  updatePasswordButtonEnabled = false;

  constructor() {
    this.stateService.setLoading(true);
    this.userProfileForm = this.formBuilder.nonNullable.group({
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]]
    });

    this.userProfileForm.valueChanges.subscribe(() => {
      this.setUpdateProfileMessage("", "");
      this.saveChangesButtonEnabled = this.firstName.valid && this.lastName.valid;
    });

    const passwordValidator: ValidatorFn = (
      control: AbstractControl
    ): ValidationErrors | null => {
      const password = control.get("newPassword");
      const confirmPassword = control.get("confirmNewPassword");
      const hasError: boolean = !!password && !!confirmPassword && password.value !== confirmPassword.value;

      return hasError ? {passwordsDoesNotMatch: true} : null;
    };

    this.passwordForm = this.formBuilder.nonNullable.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmNewPassword: ['', [Validators.required, Validators.minLength(8)]],
    }, {
      validators: [passwordValidator]
    });

    this.passwordForm.valueChanges.subscribe(() => {
      this.setUpdatePasswordMessage("", "");

      this.updatePasswordButtonEnabled =
        (this.noPassword || this.currentPassword.valid) &&
        this.newPassword.valid &&
        this.confirmNewPassword.valid &&
        this.newPassword.value == this.confirmNewPassword.value;
    });
  }

  ngOnInit() {
    this.getUserProfile();
  }

  getUserProfile() {
    this.chatService.getUserProfile().subscribe({
      next: (data) => {
        this.firstName.setValue(data.firstName);
        this.lastName.setValue(data.lastName);
        this.noPassword = data.noPassword;
        this.stateService.setLoading(false);
        this.saveChangesButtonEnabled = false;
      },
    });
  }

  updateUserProfile() {
    this.stateService.setLoading(true);
    this.chatService.updateUserProfile({
      firstName: this.firstName.value,
      lastName: this.lastName.value
    }).subscribe({
      next: () => {
        this.setUpdateProfileMessage("SUCCESS", "Profile updated successfully");
        this.stateService.setLoading(false);
      },
      error: () => {
        this.setUpdateProfileMessage("DANGER", "Something went wrong. Please try again later");
        this.stateService.setLoading(false);
      },
    });
  }

  updatePassword() {
    this.setUpdatePasswordMessage("", "");

    this.stateService.setLoading(true);
    this.chatService.updatePassword({
      currentPassword: this.noPassword ? "" : this.currentPassword.value,
      newPassword: this.newPassword.value
    }).subscribe({
      next: () => {
        this.noPassword = false;
        this.currentPassword.reset();
        this.newPassword.reset();
        this.confirmNewPassword.reset();
        this.setUpdatePasswordMessage("SUCCESS", "Password updated successfully");
        this.stateService.setLoading(false);
      },
      error: (data) => {
        if (data?.error?.error_codes?.includes("errors.credentials.incorrect")) {
          this.setUpdatePasswordMessage("DANGER", "Incorrect current password");
        } else {
          this.setUpdatePasswordMessage("DANGER", "Something went wrong. Please try again later");
        }
        this.stateService.setLoading(false);
      },
    });
  }

  private setUpdateProfileMessage(
    updateProfileMessageType: "" | "SUCCESS" | "DANGER" | "WARNING" | "SECONDARY",
    updateProfileMessage: string
  ) {
    this.updateProfileMessageType = updateProfileMessageType;
    this.updateProfileMessage = updateProfileMessage;
  }

  private setUpdatePasswordMessage(
    updatePasswordMessageType: "" | "SUCCESS" | "DANGER" | "WARNING" | "SECONDARY",
    updatePasswordMessage: string
  ) {
    this.updatePasswordMessageType = updatePasswordMessageType;
    this.updatePasswordMessage = updatePasswordMessage;
  }

  get firstName(): AbstractControl {
    return this.userProfileForm.controls['firstName'];
  }

  get lastName(): AbstractControl {
    return this.userProfileForm.controls['lastName'];
  }

  get currentPassword(): AbstractControl {
    return this.passwordForm.controls['currentPassword'];
  }

  get newPassword(): AbstractControl {
    return this.passwordForm.controls['newPassword'];
  }

  get confirmNewPassword(): AbstractControl {
    return this.passwordForm.controls['confirmNewPassword'];
  }
}
