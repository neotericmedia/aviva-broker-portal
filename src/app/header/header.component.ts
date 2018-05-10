import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { TranslateService } from 'ng2-translate';

import { BaseNavComponent } from '../base';
import { HeaderService } from './header.service';
import { InitializationService } from '../shared/initialization.service';
import { NavService } from '../base/nav.service';

@Component({
  selector: 'digital-header',
  encapsulation: ViewEncapsulation.None,
  template: require('./header.component.html'),
  styles: [require('./header.component.scss').toString()]
})
export class HeaderComponent extends BaseNavComponent {

  constructor(
    protected router: Router,
    protected toastr: ToastsManager,
    protected translate: TranslateService,
    private headerService: HeaderService,
    private initService: InitializationService,
    private navService: NavService
  ) {
    super(router);
  }

  public onClickAllQuotes() {
    // Temporary code for broker portal (Remove the outer if-else block later)
    if (this.navService.isBroker()) {
      return;
    } else {
      this.navigateTo(['/quoteSearch']);
    }
  }

  public onClickNewQuote() {
    // Temporary code for broker portal (Remove the outer if-else block later)
    if (this.navService.isBroker()) {
      this.navigateTo(['/broker/businessInfo']);
    } else {
      if (this.navService.isQuote()) {
        // notify New Quote is clicked only if the current path is '/quote'
        this.headerService.notifyNewQuoteClicked();
      } else {
        this.navigateTo(['/quote']);
      }
    }
  }

  public onClickDashboard() {
    // Temporary code for broker portal (Remove the outer if-else block later)
    if (this.navService.isBroker()) {
      return;
    } else {
      this.navigateTo(['/dashboard']);
    }
  }

  public onClickReport() {
    this.navigateTo(['/report']);
  }

  public onClickLogout() {
    this.headerService.logout().then(rsp => {
      this.initService.resetAuthentication(false);
      this.toastr.info(this.translate.instant('header.logout.status.loggingOut'));
      setTimeout(() => {
        this.navigateTo(['/login']);
      }, 2000);
    }).catch(e => {
      this.toastr.info(this.translate.instant('header.logout.status.error'));
    });
  }
}
