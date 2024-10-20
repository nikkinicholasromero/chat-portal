import {AfterViewChecked, AfterViewInit, Component, inject} from '@angular/core';
import {NgIf} from '@angular/common';
import {AuthenticationService} from '../security/authentication.service';
import {LoginDialogComponent} from "./login-dialog.component";
import {StateService} from "../shared/service/state.service";
import {Router, RouterLink} from "@angular/router";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgIf, LoginDialogComponent, RouterLink],
  providers: [AuthenticationService],
  template: `
    <header>
      <nav class="flex items-center justify-between p-6">
        <div class="flex">
          <a routerLink="/" class="-m-1.5 p-1.5">
            <img class="h-8 w-auto m-auto" src="assets/logo.png" alt="Chat">
          </a>
        </div>
        <div class="flex justify-end gap-x-2">
          @if (stateService.authenticated()) {
            <a routerLink="/profile" class="text-sm font-semibold leading-6 px-3 py-1.5 rounded-md text-black bg-white hover:text-white hover:bg-blue-500">Profile</a>
            <a href="javascript:void(0)" class="text-sm font-semibold leading-6 px-3 py-1.5 rounded-md text-rose-600 bg-white hover:text-white hover:bg-rose-500"
               (click)="authenticationService.logout()">Log out</a>
          } @else {
            <a href="javascript:void(0)" class="text-sm font-semibold leading-6 px-3 py-1.5 rounded-md text-black bg-white hover:text-white hover:bg-blue-500"
               (click)="showLoginDialog = true">Sign in</a>
          }
        </div>
      </nav>
    </header>
    <app-login-dialog
      *ngIf="showLoginDialog"
      (closesModal)="showLoginDialog = false"
      [initialEmail]="initialEmail"
    >
    </app-login-dialog>
  `
})
export class HeaderComponent implements AfterViewChecked {
  stateService = inject(StateService);
  authenticationService = inject(AuthenticationService);
  private router = inject(Router);
  showLoginDialog = false;
  initialEmail = "";

  constructor() {
    if (!this.stateService.authenticated()) {
      const parsedUrl = this.router.parseUrl(this.router.url);
      const email = parsedUrl.queryParams["e"] ? decodeURIComponent(parsedUrl.queryParams["e"]) : "";

      if (email != "") {
        this.showLoginDialog = true;
        this.initialEmail = email;
      }
    }
  }

  ngAfterViewChecked(): void {
    if (this.router.url.startsWith("/registration/confirmation") ||
        this.router.url.startsWith("/password/reset") ) {
      this.showLoginDialog = false;
    }
  }
}
