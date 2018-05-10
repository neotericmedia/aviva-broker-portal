import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { WebServiceURLs } from '../../shared/webServiceURLs';
import { InitializationService } from '../../shared';
/**
 * AuthenticationService will hold the state of the user's authentication in the angular app. This
 * will be used by AuthenticationGuard to protect routes in the angular app that must be accessed
 * only by an authenticated user.
 */
@Injectable()
export class AuthService {
  constructor(
    private http: Http,
    private initService: InitializationService
  ) { }

  public async isAuthenticated(): Promise<boolean> {
    return this.http.get(WebServiceURLs.loginStatus)
      .toPromise()
      .then(response => {
        let res = response.json();
        if (res.authenticated) {
          this.initService.setAuthentication(res.username);
        }
        return res.authenticated;
      })
      .catch(e => {
        return false;
      });
  }
}
