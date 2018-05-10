import { Component } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { setTimeout } from 'timers';
import { Router, NavigationEnd } from '@angular/router';
import { Http, RequestOptions, Headers } from '@angular/http';
import { TranslateService } from 'ng2-translate';
import { ToastsManager } from 'ng2-toastr/src/toast-manager';

import { BaseNavComponent } from '../base';
import { WebServiceURLs } from '../shared/webServiceURLs';
import { InitializationService } from '../shared/initialization.service';

@Component({
  selector: 'login',
  styleUrls: ['./login.component.scss'],
  templateUrl: './login.component.html'
})
export class LoginComponent extends BaseNavComponent {
  private username: string;
  private password: string;
  private showErrorMsg: boolean = false;
  private showAllQuotes: boolean = false;
  private ifShowSpinner: boolean = false;

  constructor(
    protected router: Router,
    protected translate: TranslateService,
    protected toastr: ToastsManager,
    private http: Http,
    private cookieService: CookieService,
    private initService: InitializationService
  ) {
    super(router);
    this.safeSubscribe(router.events).subscribe((value) => {
      if (value instanceof NavigationEnd && value['url'].indexOf('/login') >= 0
        && this.initService.hasBeenTimedOut()) {
        this.toastr.clearAllToasts();
        setTimeout(() => {
          this.toastr.error(this.translate.instant('login.sessionExpired'));
        }, 1);
        this.initService.resetAuthentication(false);
      }
    });
  }

  private authenticate() {
    this.showErrorMsg = false;
    this.toggleSpinner();

    if (this.username && this.password) {
      let url = WebServiceURLs.login;
      let headers = new Headers({ 'Content-Type': 'application/json' });

      let login: any = {};
      login.username = this.username;
      login.password = this.password;

      this.http.post(url, login, null).toPromise().then(response => {
        if (response.status === 200) {
          this.initService.setAuthentication(this.username);
          this.navigateTo(['/dashboard']);
        } else if (response.status === 403) {
          this.showErrorMsg = true;
        }
        this.toggleSpinner();
      }).catch(e => {
        this.showErrorMsg = true;
        this.toggleSpinner();
      });
    }
  }

  // Temporary code for broker portal
  private authenticateBroker() {
    this.showErrorMsg = false;
    this.toggleSpinner();

    if (this.username && this.password) {
      let url = WebServiceURLs.login;
      let headers = new Headers({ 'Content-Type': 'application/json' });

      let login: any = {};
      login.username = this.username;
      login.password = this.password;

      this.http.post(url, login, null).toPromise().then(response => {
        if (response.status === 200) {
          this.initService.setAuthentication(this.username);
          this.navigateTo(['/broker/businessInfo']);
        } else if (response.status === 403) {
          this.showErrorMsg = true;
        }
        this.toggleSpinner();
      }).catch(e => {
        this.showErrorMsg = true;
        this.toggleSpinner();
      });
    }
  }

  private toggleSpinner() {
    this.ifShowSpinner = !this.ifShowSpinner;
  }
}
