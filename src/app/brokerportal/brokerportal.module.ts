import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  AccordionModule, BsDatepickerModule, DatepickerModule, TooltipModule, TypeaheadModule
} from 'ngx-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from 'ng2-translate';
import { BrokerBindComponent } from './bind/broker-bind.component';
import { BrokerBusinessInfoComponent } from './businessInfo/businessInfo.component';
import { BrokerSummaryComponent } from './summary/broker-summary.component';
import { DeviateByComponent } from './shared/deviate-by/deviate-by.component';
import { IndustryCodeSearchComponent } from './industrycodesearch/industrycodesearch.component';
import { SharedModule } from '../shared/shared.module';
import { CoreModule } from '../core/core.module';

import { QuoteModule } from '../quote/quote.module';

@NgModule({
  declarations: [
    BrokerBindComponent,
    BrokerBusinessInfoComponent,
    BrokerSummaryComponent,
    IndustryCodeSearchComponent,
    DeviateByComponent
  ],
  imports: [
    AccordionModule,
    BrowserModule,
    BsDatepickerModule,
    DatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    CoreModule,
    QuoteModule,
    TooltipModule,
    TranslateModule,
    TypeaheadModule
  ],
  exports: []
})
export class BrokerPortalModule { }
