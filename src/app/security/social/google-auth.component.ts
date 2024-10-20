import {Component, inject, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {ChatService} from "../../shared/service/chat.service";
import {StateService} from "../../shared/service/state.service";
import {AuthenticationService} from "../authentication.service";

@Component({
  selector: 'app-google-auth',
  standalone: true,
  template: ``
})
export class GoogleAuthComponent implements OnInit {
  private router = inject(Router);
  private stateService = inject(StateService);
  private chatService = inject(ChatService);
  private authenticationService = inject(AuthenticationService);

  ngOnInit(): void {
    this.stateService.setLoading(true);

    const parsedUrl = this.router.parseUrl(this.router.url);
    const state = parsedUrl.queryParams["state"] ? decodeURIComponent(parsedUrl.queryParams["state"]) : "";
    const code = parsedUrl.queryParams["code"] ? decodeURIComponent(parsedUrl.queryParams["code"]) : "";
    const scope = parsedUrl.queryParams["scope"] ? decodeURIComponent(parsedUrl.queryParams["scope"]) : "";

    if (!state || !code || !scope) {
      this.router.navigate(['/']).then();
      this.stateService.setLoading(false);
      return;
    }

    this.chatService.getGoogleToken({
      state: state,
      code: code,
      scope: scope
    }).subscribe({
      next: (response) => {
        this.authenticationService.authenticateSocial(response.accessToken);
        this.router.navigate(['/']).then();
        this.stateService.setLoading(false);
      },
      error: () => {
        this.router.navigate(['/']).then();
        this.stateService.setLoading(false);
      }
    });
  }
}
