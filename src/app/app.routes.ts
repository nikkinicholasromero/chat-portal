import {Routes} from '@angular/router';
import {RegistrationConfirmationComponent} from "./pages/registration-confirmation/registration-confirmation.component";
import {PasswordResetComponent} from "./pages/password-reset/password-reset.component";
import {HomeComponent} from "./pages/home/home.component";
import {PageNotFoundComponent} from "./pages/page-not-found/page-not-found.component";
import {ProfileComponent} from "./pages/home/profile/profile.component";
import {authGuardFn} from "./security/can-activate.function";
import {GoogleAuthComponent} from "./security/social/google-auth.component";
import {FacebookAuthComponent} from "./security/social/facebook-auth.component";
import {MicrosoftAuthComponent} from "./security/social/microsoft-auth.component";

export const routes: Routes = [
  {
    path: 'registration/confirmation',
    component: RegistrationConfirmationComponent,
    canActivate: [authGuardFn]
  },
  {
    path: 'password/reset',
    component: PasswordResetComponent,
    canActivate: [authGuardFn]
  },
  {
    path: 'auth/google',
    component: GoogleAuthComponent,
  },
  {
    path: 'auth/facebook',
    component: FacebookAuthComponent,
  },
  {
    path: 'auth/microsoft',
    component: MicrosoftAuthComponent,
  },
  {
    path: '',
    component: HomeComponent,
    canActivate: [authGuardFn],
    children: [
      {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [authGuardFn]
      }
    ],
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];
