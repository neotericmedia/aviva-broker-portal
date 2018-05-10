import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Http } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateLoader, TranslateStaticLoader } from 'ng2-translate';
import { AccordionModule } from 'ngx-bootstrap';

import { CoreModule } from '../core/core.module';
import { EmailModalComponent } from './email-modal/email-modal.component';
import { ConfirmModalComponent } from './confirm-modal/confirm-modal.component';
import { InputEnvelopeComponent } from './input-envelope';
import { AccordionSectionComponent } from './accordion-section';
import { FormDropdownComponent } from './form-dropdown/form-dropdown.component';
import { NumberInputComponent } from './number-input';
import { RoundPipe, DeductibleFormatter, NumberFormatter } from './pipes';
import { DisablingMouseWheelDirective, NumberOnlyFormatterDirective } from './directives';
import { PayeeMortgageeModalComponent } from './payee-mortgagee-modal/payee-mortgagee-modal.component';
import { ChoiceScrollerComponent } from './choice-scroller/choice-scroller.component';

@NgModule({
  declarations: [
    AccordionSectionComponent,
    EmailModalComponent,
    ConfirmModalComponent,
    InputEnvelopeComponent,
    FormDropdownComponent,
    NumberInputComponent,
    RoundPipe,
    DeductibleFormatter,
    NumberFormatter,
    DisablingMouseWheelDirective,
    NumberOnlyFormatterDirective,
    PayeeMortgageeModalComponent,
    ChoiceScrollerComponent
  ],
  imports: [
    AccordionModule,
    CoreModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: (http: Http) => new TranslateStaticLoader(http, process.env.i18nPath, '.json'),
      deps: [Http]
    })
  ],
  exports: [
    AccordionSectionComponent,
    EmailModalComponent,
    ConfirmModalComponent,
    InputEnvelopeComponent,
    FormDropdownComponent,
    NumberInputComponent,
    RoundPipe,
    DeductibleFormatter,
    NumberFormatter,
    DisablingMouseWheelDirective,
    NumberOnlyFormatterDirective,
    PayeeMortgageeModalComponent,
    ChoiceScrollerComponent
  ]
})
export class SharedModule {}
