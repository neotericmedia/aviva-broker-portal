import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpModule } from '@angular/http';
import { NgModule, ApplicationRef } from '@angular/core';
import { removeNgStyles, createNewHosts, createInputTransfer } from '@angularclass/hmr';
import { RouterModule, PreloadAllModules } from '@angular/router';
import {
  AccordionModule, BsDatepickerModule, TooltipModule, DatepickerModule, TypeaheadModule
} from 'ngx-bootstrap';
import { TranslateModule, TranslateLoader, TranslateStaticLoader } from 'ng2-translate';
import { Http } from '@angular/http';
import { ToastModule } from 'ng2-toastr/ng2-toastr';
/*
 * Platform and Environment providers/directives/pipes
 */
import { ENV_PROVIDERS } from './environment';
import { AppRoutingModule } from './routing/app-routing.module';
import { CoreModule } from './core/core.module';
import { BrokerPortalModule } from './brokerportal/brokerportal.module';

import { SharedModule } from './shared/shared.module';
import { QuoteModule } from './quote/quote.module';

// App is our top level component
import { AppComponent } from './app.component';
import { APP_RESOLVER_PROVIDERS } from './app.resolver';
import { AppState, InternalStateType } from './app.service';

import { LoginComponent } from './login';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HeaderComponent } from './header/header.component';
import { ReportComponent } from './report/report.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { CookieModule } from 'ngx-cookie';
import { SidebarModule } from 'ng-sidebar';
import { InitializationService, InterceptedHttpService } from './shared';

// Application wide providers
const APP_PROVIDERS = [
  ...APP_RESOLVER_PROVIDERS,
  AppState
];

type StoreType = {
  state: InternalStateType,
  restoreInputValues: () => void,
  disposeOldHosts: () => void
};

/**
 * AppModule is the main entry point into Angular2's bootstraping process
 */
@NgModule({
  bootstrap: [AppComponent],
  declarations: [
    AppComponent,
    DashboardComponent,
    HeaderComponent,
    LoginComponent,
    ReportComponent
  ],
  imports: [ // import Angular's modules
    CoreModule,
    BrokerPortalModule,
    BrowserModule,
    BsDatepickerModule.forRoot(),
    CookieModule.forRoot(),
    BrowserAnimationsModule,
    ToastModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    SidebarModule.forRoot(),
    HttpModule,
    AppRoutingModule,
    AccordionModule.forRoot(),
    TooltipModule.forRoot(),
    DatepickerModule.forRoot(),
    TypeaheadModule.forRoot(),
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: (http: Http) => new TranslateStaticLoader(http, process.env.i18nPath, '.json'),
      deps: [Http]
    }),
    NgxChartsModule,
    SharedModule,
    QuoteModule
  ],
  // expose our Services and Providers into Angular's dependency injection
  providers: [
    ENV_PROVIDERS,
    APP_PROVIDERS,
    { provide: Http, useClass: InterceptedHttpService },
    InitializationService
  ]
})
export class AppModule {

  constructor(
    public appRef: ApplicationRef,
    public appState: AppState
  ) { }

  public hmrOnInit(store: StoreType) {
    if (!store || !store.state) {
      return;
    }
    console.log('HMR store', JSON.stringify(store, null, 2));
    // set state
    this.appState._state = store.state;
    // set input values
    if ('restoreInputValues' in store) {
      let restoreInputValues = store.restoreInputValues;
      setTimeout(restoreInputValues);
    }

    this.appRef.tick();
    delete store.state;
    delete store.restoreInputValues;
  }

  public hmrOnDestroy(store: StoreType) {
    const cmpLocation = this.appRef.components.map((cmp) => cmp.location.nativeElement);
    // save state
    const state = this.appState._state;
    store.state = state;
    // recreate root elements
    store.disposeOldHosts = createNewHosts(cmpLocation);
    // save input values
    store.restoreInputValues = createInputTransfer();
    // remove styles
    removeNgStyles();
  }

  public hmrAfterDestroy(store: StoreType) {
    // display new elements
    store.disposeOldHosts();
    delete store.disposeOldHosts;
  }
}
