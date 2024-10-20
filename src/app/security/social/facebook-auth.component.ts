import {Component, inject, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {ChatService} from "../../shared/service/chat.service";
import {StateService} from "../../shared/service/state.service";
import {AuthenticationService} from "../authentication.service";

@Component({
  selector: 'app-facebook-auth',
  standalone: true,
  template: ``
})
export class FacebookAuthComponent implements OnInit {
  private router = inject(Router);
  private stateService = inject(StateService);
  private chatService = inject(ChatService);
  private authenticationService = inject(AuthenticationService);

  ngOnInit(): void {
    this.stateService.setLoading(true);

    const parsedUrl = this.router.parseUrl(this.router.url);
    const code = parsedUrl.queryParams["code"] ? decodeURIComponent(parsedUrl.queryParams["code"]) : "";

    if (!code) {
      this.router.navigate(['/']).then();
      this.stateService.setLoading(false);
      return;
    }

    this.chatService.getFacebookToken({
      code: code
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
