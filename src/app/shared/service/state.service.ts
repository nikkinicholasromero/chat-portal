import {Injectable, signal} from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private _loading = signal(false);
  private _authenticated = signal(false);

  get loading() {
    return this._loading;
  }

  setLoading(value: boolean) {
    this._loading.set(value);
  }

  get authenticated() {
    return this._authenticated;
  }

  setAuthenticated(value: boolean) {
    this._authenticated.set(value);
  }
}
