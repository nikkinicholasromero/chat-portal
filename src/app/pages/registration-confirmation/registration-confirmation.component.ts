import {Component, inject, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {ChatService} from "../../shared/service/chat.service";
import {NgIf} from "@angular/common";
import {StateService} from "../../shared/service/state.service";
import {HeaderComponent} from "../../components/header.component";
import {AlertComponent} from "../../components/alert.component";

@Component({
  selector: 'app-registration-confirmation',
  standalone: true,
  imports: [NgIf, HeaderComponent, AlertComponent],
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
                <h2 class="mt-5 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Registration</h2>
              </div>

              <div>
                <app-alert [message]="message" [messageType]="messageType" *ngIf="message != ''"></app-alert>
              </div>

              <button type="button"
                      class="btn-primary"
                      *ngIf="showButton"
                      (click)="buttonAction()">
                {{ buttonLabel }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegistrationConfirmationComponent implements OnInit {
  private router = inject(Router);
  private chatService = inject(ChatService);
  private stateService = inject(StateService);
  messageType: "" | "SUCCESS" | "DANGER" | "WARNING" | "SECONDARY" = "";
  message = "";
  showButton = false;
  buttonAction = () => {
  };
  buttonLabel = "";

  ngOnInit() {
    const parsedUrl = this.router.parseUrl(this.router.url);
    const email = parsedUrl.queryParams["e"] ? decodeURIComponent(parsedUrl.queryParams["e"]) : "";
    const confirmationCode = parsedUrl.queryParams["c"] ? decodeURIComponent(parsedUrl.queryParams["c"]) : "";

    if (!email || !confirmationCode) {
      this.handleError();
    }

    this.stateService.setLoading(true);
    this.chatService.confirmRegistration({email: email, confirmationCode: confirmationCode})
      .subscribe({
        next: () => {
          this.setMessage("SUCCESS", "Account confirmed. You may now login to your account");
          this.showButton = true;
          this.buttonAction = () => {
            this.router.navigate(['/'], {queryParams: {e: email}}).then();
          };
          this.buttonLabel = "Back";
          this.stateService.setLoading(false);
        },
        error: () => {
          this.handleError();
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

  private handleError() {
    this.stateService.setLoading(false);
    this.setMessage("DANGER", "Account confirmation failed. Something went wrong. Please try again later");
    this.showButton = true;
    this.buttonAction = () => {
      window.location.reload();
    };
    this.buttonLabel = "Retry";
  }

  back() {
    this.router.navigate(['/']).then();
  }
}
