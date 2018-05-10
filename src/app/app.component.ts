/*
 * Angular 2 decorators and services
 */
import * as moment from 'moment';
import {
  Component,
  OnInit,
  ViewEncapsulation,
  ViewContainerRef
} from '@angular/core';
import { AppState } from './app.service';
import { QuoteService } from './quote/shared/quote.service';
import { HeaderService } from './header/header.service';
import { NavService } from './base/nav.service';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { TranslateService } from 'ng2-translate';
import { InitializationService, GlobalObjectWrapperService } from './shared';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { frLocale } from 'ngx-bootstrap/locale';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [
    './app.component.scss',
    '../../node_modules/bootstrap-sass/assets/stylesheets/_bootstrap.scss',
    '../../node_modules/font-awesome/scss/font-awesome.scss',
    '../../node_modules/ng2-toastr/bundles/ng2-toastr.min.css'
  ],
  providers: [QuoteService, HeaderService, NavService, GlobalObjectWrapperService],
  template: `
    <main>
      <digital-header></digital-header>
      <router-outlet></router-outlet>
    </main>
  `
})
export class AppComponent implements OnInit {
  constructor(
    public appState: AppState,
    public initService: InitializationService,
    public translate: TranslateService,
    public localeService: BsLocaleService,
    public toastr: ToastsManager,
    public vcr: ViewContainerRef
  ) {
    translate.addLangs(['en', 'fr']);
    const userLang = this.initService.getUserLang();
    translate.setDefaultLang(userLang);
    translate.use(userLang);
    // Define french for ngx-bootstrap
    defineLocale('fr', frLocale);
    // Globally set locale to ngx-bootstrap datepicker
    this.localeService.use(userLang);
    // Globally set locale to moment
    moment.locale(userLang);
    this.toastr.setRootViewContainerRef(vcr);
  }

  public ngOnInit() {
    console.log('Initial App State', this.appState.state);
  }
}
