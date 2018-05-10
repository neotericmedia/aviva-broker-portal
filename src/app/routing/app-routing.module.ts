import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
  BusinessInfoComponent,
  CoverageInfoComponent,
  QuoteSearchComponent,
  QuoteSummaryComponent,
  BindComponent
} from '../quote';
import { LoginComponent } from '../login';
import { DashboardComponent } from './../dashboard/dashboard.component';
import { AuthGuard, AuthService, DeactivateGuardComponent } from './authentication';
import { ReportComponent } from './../report/report.component';
import { BrokerSummaryComponent } from '../brokerportal/summary/broker-summary.component';
import { IndustryCodeSearchComponent } from '../brokerportal/industrycodesearch/industrycodesearch.component';
import { BrokerBusinessInfoComponent } from '../brokerportal/businessInfo/businessInfo.component';
import { BrokerBindComponent } from '../brokerportal/bind/broker-bind.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }, {
    path: 'login',
    component: LoginComponent
  }, {
    path: 'quote',
    component: BusinessInfoComponent,
    canActivate: [AuthGuard],
    canDeactivate: [DeactivateGuardComponent]
  }, {
    path: 'quote/:quoteNumber',
    component: BusinessInfoComponent,
    canActivate: [AuthGuard],
    canDeactivate: [DeactivateGuardComponent]
  }, {
    path: 'quote/:quoteNumber/copy',
    component: BusinessInfoComponent,
    canActivate: [AuthGuard],
    canDeactivate: [DeactivateGuardComponent]
  }, {
    path: 'coverageInfo/:quoteNumber',
    component: CoverageInfoComponent,
    canActivate: [AuthGuard],
    canDeactivate: [DeactivateGuardComponent]
  }, {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  }, {
    path: 'summary',
    component: QuoteSummaryComponent,
    canActivate: [AuthGuard]
  }, {
    path: 'summary/:quoteNumber',
    component: QuoteSummaryComponent,
    canActivate: [AuthGuard]
  }, {
    path: 'bind/:quoteNumber',
    component: BindComponent,
    canActivate: [AuthGuard],
    canDeactivate: [DeactivateGuardComponent]
  }, {
    path: 'quoteSearch',
    component: QuoteSearchComponent,
    canActivate: [AuthGuard]
  }, {
    path: 'report',
    component: ReportComponent,
    canActivate: [AuthGuard]
  }, {
    path: 'broker',
    canActivate: [AuthGuard],
    children: [{
      path: 'industrycodesearch',
      component: IndustryCodeSearchComponent,
      canActivate: [AuthGuard]
    }, {
      path: 'businessInfo',
      component: BrokerBusinessInfoComponent,
      canActivate: [AuthGuard],
      canDeactivate: [DeactivateGuardComponent]
    }, {
      path: 'businessInfo/:quoteNumber',
      component: BrokerBusinessInfoComponent,
      canActivate: [AuthGuard],
      canDeactivate: [DeactivateGuardComponent]
    }, {
      path: 'businessInfo/:quoteNumber/copy',
      component: BrokerBusinessInfoComponent,
      canActivate: [AuthGuard],
      canDeactivate: [DeactivateGuardComponent]
    }, {
      path: 'summary',
      component: BrokerSummaryComponent,
      canActivate: [AuthGuard]
    }, {
      path: 'summary/:quoteNumber',
      component: BrokerSummaryComponent,
      canActivate: [AuthGuard]
    }, {
      path: 'bind/:quoteNumber',
      component: BrokerBindComponent,
      canActivate: [AuthGuard]
    }]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard, AuthService, DeactivateGuardComponent]
})
export class AppRoutingModule { }
