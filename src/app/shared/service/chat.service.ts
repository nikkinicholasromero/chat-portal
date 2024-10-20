import {inject, Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {EmailStatus} from "../../security/email-status.type";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private http = inject(HttpClient);

  private httpOptions = {
    headers: new HttpHeaders({
      "Content-Type": "application/json",
    }),
  };

  getEmailStatus(email: string): Observable<{ status: EmailStatus }> {
    return this.http.get<{ status: EmailStatus }>(`${environment.chatServiceHost}/user?email=${email}`);
  }

  registerUser(request: {
    email: string,
    password: string,
    firstName: string,
    lastName: string
  }): Observable<any> {
    return this.http.post<any>(`${environment.chatServiceHost}/user/registration`, request, this.httpOptions);
  }

  sendConfirmationCode(email: string): Observable<any> {
    return this.http.post<any>(`${environment.chatServiceHost}/user/registration/confirmation/${email}`, {}, this.httpOptions);
  }

  confirmRegistration(request: { email: string, confirmationCode: string }): Observable<any> {
    return this.http.post<any>(`${environment.chatServiceHost}/user/registration/confirmation`, request, this.httpOptions);
  }

  sendPasswordResetCode(email: string): Observable<any> {
    return this.http.post<any>(`${environment.chatServiceHost}/user/password/reset/${email}`, {}, this.httpOptions);
  }

  resetPassword(request: { email: string, passwordResetCode: string, newPassword: string }): Observable<any> {
    return this.http.post<any>(`${environment.chatServiceHost}/user/password/reset`, request, this.httpOptions);
  }

  getToken(request: { email: string, password: string }): Observable<{ accessToken: string }> {
    return this.http.post<{ accessToken: string }>(`${environment.chatServiceHost}/token`, request, this.httpOptions);
  }

  getGoogleToken(request: {state: string, code: string, scope: string}): Observable<{ accessToken: string }> {
    return this.http.post<{ accessToken: string }>(`${environment.chatServiceHost}/token/google`, request, this.httpOptions);
  }

  getFacebookToken(request: {code: string}): Observable<{ accessToken: string }> {
    return this.http.post<{ accessToken: string }>(`${environment.chatServiceHost}/token/facebook`, request, this.httpOptions);
  }

  getMicrosoftToken(request: {code: string}): Observable<{ accessToken: string }> {
    return this.http.post<{ accessToken: string }>(`${environment.chatServiceHost}/token/microsoft`, request, this.httpOptions);
  }

  getUserProfile(): Observable<{ firstName: string, lastName: string, noPassword: boolean }> {
    return this.http.get<{ firstName: string, lastName: string, noPassword: boolean }>(`${environment.chatServiceHost}/user/profile`, this.httpOptions);
  }

  updateUserProfile(request: { firstName: string, lastName: string }): Observable<any> {
    return this.http.post<any>(`${environment.chatServiceHost}/user/profile`, request, this.httpOptions);
  }

  updatePassword(request: { currentPassword: string, newPassword: string }): Observable<any> {
    return this.http.post<any>(`${environment.chatServiceHost}/user/password`, request, this.httpOptions);
  }
}
