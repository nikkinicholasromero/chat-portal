import {inject, Injectable} from "@angular/core";
import {JwtHelperService} from "@auth0/angular-jwt";
import {ChatService} from "../shared/service/chat.service";
import {StateService} from "../shared/service/state.service";
import {Router} from "@angular/router";

@Injectable({
  providedIn: "root"
})
export class AuthenticationService {
  private chatService = inject(ChatService);
  private jwtHelperService = inject(JwtHelperService);
  private stateService = inject(StateService);
  private router = inject(Router);

  constructor() {
    try {
      const accessToken: string | null = localStorage.getItem("access_token");
      this.stateService.setAuthenticated(!!accessToken && !this.jwtHelperService.isTokenExpired(accessToken));
    } catch (err) {
      localStorage.removeItem("access_token");
      this.stateService.setAuthenticated(false);
    }
  }

  authenticate(
    email: string,
    password: string,
    error: Function) {
    this.stateService.setLoading(true);
    this.chatService.getToken({email: email, password: password}).subscribe({
      next: (response) => {
        try {
          localStorage.setItem("access_token", response.accessToken);
          this.stateService.setAuthenticated(true);
        } catch (err) {
          localStorage.removeItem("access_token");
          this.stateService.setAuthenticated(false);
        }
        this.stateService.setLoading(false);
      },
      error: (data: any) => {
        this.stateService.setLoading(false);
        error(data);
      }
    });
  }

  authenticateSocial(accessToken: string) {
    localStorage.setItem("access_token", accessToken);
    this.stateService.setAuthenticated(true);
  }

  logout() {
    this.expireSession();
    this.router.navigate(['/']).then();
  }

  expireSession() {
    localStorage.removeItem("access_token");
    this.stateService.setAuthenticated(false);
  }
}
