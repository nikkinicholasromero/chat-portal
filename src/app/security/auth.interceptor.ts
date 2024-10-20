import {inject, Injectable} from "@angular/core";
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from "@angular/common/http";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { AuthenticationService } from "./authentication.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authenticationService = inject(AuthenticationService);

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token: string = localStorage.getItem("access_token")!;

    if (!token) {
      return next.handle(req);
    }

    const req1 = req.clone({
      headers: req.headers.set("Authorization", `Bearer ${token}`),
    });

    return next.handle(req1).pipe(
      tap(
        (event) => {
          if (event instanceof HttpResponse) {
            const authorization = event.headers.get("Authorization");
            if (authorization !== null) {
              localStorage.setItem("access_token", authorization.split("Bearer ")[1]);
            }
          }
        },
        (error) => {
          if (error.status === 401) {
            if (localStorage.getItem("access_token") != null) {
              alert("Your session has expired. Please re-login.")
            }
            this.authenticationService.logout();
          }
        }
      )
    );
  }
}
