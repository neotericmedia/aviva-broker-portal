import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from 'ng2-translate';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import {
  AccordionModule, BsDatepickerModule, DatepickerModule, TooltipModule, TypeaheadModule
} from 'ngx-bootstrap';
import { SidebarModule } from 'ng-sidebar';

import { CoreModule } from '../core/core.module';
import { SharedModule } from '../shared/shared.module';

import {
  AddressDetailsComponent,
  BusinessDateQuoteComponent,
  BusinessInfoComponent,
  CoverageChoicesComponent
} from './businessInfo';
import {
  CoverageInfoComponent,
  CoverageInputComponent,
  LobDetailsComponent,
  LobQuestionsComponent
} from './coverageInfo';
import { QuoteSearchComponent } from './search';
import { QuoteSummaryComponent } from './summary/quote-summary.component';
import { BindComponent } from './bind';
import { BindPartyComponent } from './bind';
import { PremiumDetailsComponent } from './shared/premium-details/premium-details.component';
import { InfoCardComponent } from './shared/info-card/info-card.component';
import { QuoteBreadcrumbComponent } from './shared/quote-breadcrumb/quote-breadcrumb.component';
import { AddressComponent, AddressFieldsComponent } from './shared/address';
import { IndustryRatingComponent } from './businessInfo/industry-rating/industry-rating.component';
import { AdditionalQuestionsComponent } from '../brokerportal/additional-questions/additional-questions.component';

@NgModule({
  declarations: [
    AdditionalQuestionsComponent,
    AddressComponent,
    AddressDetailsComponent,
    AddressFieldsComponent,
    BindComponent,
    BindPartyComponent,
    BusinessDateQuoteComponent,
    BusinessInfoComponent,
    CoverageChoicesComponent,
    CoverageInfoComponent,
    CoverageInputComponent,
    IndustryRatingComponent,
    InfoCardComponent,
    LobDetailsComponent,
    LobQuestionsComponent,
    PremiumDetailsComponent,
    QuoteBreadcrumbComponent,
    QuoteSearchComponent,
    QuoteSummaryComponent
  ],
  imports: [
    AccordionModule,
    BrowserModule,
    BsDatepickerModule,
    CoreModule,
    DatepickerModule,
    FormsModule,
    Ng2SmartTableModule,
    ReactiveFormsModule,
    SharedModule,
    SidebarModule,
    TooltipModule,
    TranslateModule,
    TypeaheadModule
  ],
  exports: [
    AdditionalQuestionsComponent,
    AddressDetailsComponent,
    BindComponent,
    BindPartyComponent,
    BusinessDateQuoteComponent,
    BusinessInfoComponent,
    CoverageChoicesComponent,
    CoverageInfoComponent,
    IndustryRatingComponent,
    InfoCardComponent,
    PremiumDetailsComponent,
    QuoteBreadcrumbComponent,
    QuoteSearchComponent,
    QuoteSummaryComponent,
    LobDetailsComponent
  ]
})
export class QuoteModule {}
