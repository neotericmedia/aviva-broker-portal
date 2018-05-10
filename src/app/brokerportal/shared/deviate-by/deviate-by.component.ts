import { Http } from '@angular/http';
import { Component, Input, Output, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

import { TranslateService } from 'ng2-translate';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

import { NumberRangeValidator } from '../../../shared/validation/numberRangeValidator.ts';
import { WebServiceURLs } from '../../../shared/webServiceURLs';
import { BaseFormComponent } from '../../../base';

import { QuoteSummaryService } from '../../../quote/summary/quote-summary.service';
import { Quote } from '../../../quote/models';

@Component({
  selector: 'deviate-by',
  templateUrl: './deviate-by.component.html',
  styleUrls: ['./deviate-by.component.scss']
})
export class DeviateByComponent extends BaseFormComponent
  implements OnInit, AfterViewInit {
  @Input() protected parentForm: FormGroup;
  @Input() protected premiumValue: any;
  private deviateByForm: FormGroup;
  private deviation: number;
  private premiumText = 'generic.premiumDetails.title.premium';
  private quoteNumber: string;
  private originalTotalPremium: number;

  constructor(
    protected toastr: ToastsManager,
    protected route: ActivatedRoute,
    protected formBuilder: FormBuilder,
    protected deviateByService: QuoteSummaryService,
    protected translate: TranslateService,
    protected router: Router,
    protected http: Http
  ) {
    super(translate, router);
  }

  public ngOnInit() {
    this.deviateByForm = new FormGroup({
      deviation: new FormControl('', [NumberRangeValidator(-100, 100)])
    });
    this.parentForm.addControl('deviation', this.deviateByForm);
  }

  public ngAfterViewInit() {
    let quoteNumber: string;
    this.safeSubscribe(this.route.params).subscribe(
      (params: Params) => (quoteNumber = params['quoteNumber'])
    );
    this.deviateByService.retrieveQuote(quoteNumber).then((quote: Quote) => {
      try {
        this.quoteNumber = quote.getQuoteId;
        if (quote.getDeviation) {
          this.deviateByForm.controls.deviation.setValue(quote.getDeviation);
          this.deviation = quote.getDeviation;
        }
        if (quote.getOriginalTotalPremimum) {
          this.originalTotalPremium = quote.getOriginalTotalPremimum;
          this.premiumValue.calculatedTotalPremium = quote.getDeviatedTotalPremium;
        }
      } catch (e) {
        console.log('Error retrieving deviated value: ', e);
      }
    });
  }

  public onRefreshClick(resetValue?: boolean) {
    let deviation = resetValue
      ? 0
      : this.deviateByForm.controls.deviation.value;
    if (typeof deviation !== 'number') {
      deviation = parseInt(deviation, 10);
    }
    if (isNaN(deviation)) {
      this.toastr.error(
        this.translate.instant('generic.premiumDetails.calculationError')
      );
    } else {
      let updatedPremium = this.originalTotalPremium * (1 + deviation * 0.01);
      let roundedOffPremium = Math.round(updatedPremium);
      const url = WebServiceURLs.quoteDeviation + deviation;
      this.safeSubscribe(
        this.http
          .post(url, {
            quoteNumber: this.quoteNumber,
            premium: roundedOffPremium
          })
          .map(res => res)
      ).subscribe(res => {
        if (resetValue) {
          this.deviateByForm.controls.deviation.setValue(deviation);
        }
        this.premiumValue.calculatedTotalPremium = roundedOffPremium;
        this.deviation = deviation;
      });
    }
  }

  public onDeviationKeyDown(event) {
    if (this.deviateByForm.valid && event.keyCode === 13) {
      this.onRefreshClick();
    }
  }

  protected checkShowDeviation(): boolean {
    const showDeviation = this.premiumValue.calculatedTotalPremium
      ? this.premiumValue.calculatedTotalPremium !== this.originalTotalPremium
      : false;
    this.premiumText = showDeviation
      ? 'generic.premiumDetails.title.newPremium'
      : 'generic.premiumDetails.title.premium';
    return showDeviation;
  }
}
