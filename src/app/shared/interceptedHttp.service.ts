/**
 * The is an Comstomized Http Service featuring intercepting response with
 * 403 status code, and then redirecting to the login page.
 */
import { Injectable } from '@angular/core';
import { Request, XHRBackend, RequestOptions, Response, Http, RequestOptionsArgs, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { Router } from '@angular/router';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { InitializationService } from './initialization.service';

@Injectable()
export class InterceptedHttpService extends Http {

  private supportedLangs = {
    en: 'en-US',
    fr: 'fr-CA'
  };
  private defaultUserLang = 'en';
  private defaultUserLocale = 'en-US';

  constructor(
    private backend: XHRBackend,
    private defaultOptions: RequestOptions,
    private toastr: ToastsManager,
    private router: Router,
    private initService: InitializationService
  ) {
    super(backend, defaultOptions);
  }

  public request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
    const headers = this.getHeaders(url, options);
    const userLang = this.initService.getUserLang() || this.defaultUserLang;
    const userLocale = this.initService.getUserLocale() || this.supportedLangs[userLang] || this.supportedLangs[this.defaultUserLang];
    headers.set('Accept-Language', [userLocale, userLang + ';q=0.8'].join(','));

    return super.request(url, options).catch((error: Response) => {
      // Avantage blocks all 401 unauthorized; therefore, use 403 instead.
      // when getting Forbidden (403), the session has expired.
      if ((error.status === 403) && (window.location.href.match(/\?/g) || []).length < 2) {
        console.log('The authentication session expired or the user is not authorised.');

        if (window.location.pathname !== '/login' && !this.initService.hasBeenTimedOut()) {
          this.initService.resetAuthentication(true);
          setTimeout(() => {
            this.router.navigate(['/login'], {
              queryParamsHandling: 'preserve'
            });
          }, 2000);
        }
      }
      return Observable.throw(error);
    });
  }

  private getHeaders(url: string | Request, options?: RequestOptionsArgs): Headers {
    let headers: Headers;
    if (typeof url === 'string') {
      if (!options) {
        options = {} as RequestOptionsArgs;
      }
      if (!options.headers) {
        options.headers = new Headers();
      }
      headers = options.headers;
    } else if (url instanceof Request) {
      headers = url.headers;
    }
    return headers;
  }
}
