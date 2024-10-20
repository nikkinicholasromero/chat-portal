import {ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot} from '@angular/router';
import {AuthenticationService} from "./authentication.service";
import {inject} from "@angular/core";
import {JwtHelperService} from "@auth0/angular-jwt";

export const authGuardFn: CanActivateFn = (
  next: ActivatedRouteSnapshot,
  state: RouterStateSnapshot) => {
  const router = inject(Router);
  const jwtHelperService = inject(JwtHelperService);
  const authenticationService = inject(AuthenticationService);

  const accessToken: string | null = localStorage.getItem("access_token");
  const isAuthenticated = !!accessToken && !jwtHelperService.isTokenExpired(accessToken);
  const secured_paths = ["profile"];

  if (
    next?.url[0]?.path === "registration" ||
    next?.url[0]?.path === "password") {
    authenticationService.expireSession();
    return true;
  }

  if (!isAuthenticated && secured_paths.includes(next?.url[0]?.path)) {
    router.navigate(['/']).then();
    return false;
  }

  return true;
}
