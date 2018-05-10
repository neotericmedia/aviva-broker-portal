import { Http } from '@angular/http';
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

import { TranslateService } from 'ng2-translate';
import { deserialize } from 'serializer.ts/Serializer';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

import { EmailModalComponent, DeductibleFormatter } from '../../shared';
import { WebServiceURLs } from '../../shared/webServiceURLs';
import { BaseFormComponent } from '../../base';

import { QuoteSummaryService } from './quote-summary.service';
import { IndustrySearchService } from '../businessInfo/industry-search/industry-search.service';
import { QuoteService } from '../../quote/shared/quote.service';
import {
  BusinessInfo,
  IndustryCodeCondition,
  LobCoverage,
  Quote,
  QuoteLOBCoverage
} from '../models';
import { NumberRangeValidator } from '../../shared/validation/numberRangeValidator.ts';

@Component({
  selector: 'quote-summary',
  styleUrls: ['./quote-summary.component.scss'],
  templateUrl: './quote-summary.component.html',
  providers: [QuoteSummaryService, IndustrySearchService]
})
export class QuoteSummaryComponent extends BaseFormComponent
  implements OnInit, AfterViewInit {
  protected lobCoverageList: QuoteLOBCoverage[] = [];
  protected quoteSummaryForm: FormGroup;
  protected quoteNumber: string;
  private quoteStatus: number;
  private quoteStatusMap = {};
  private premiumText = 'generic.premiumDetails.title.premium';
  private originalTotalPremium: number;
  private calculatedTotalPremium: number;
  private businessInfo: BusinessInfo;
  private industryCodeConditions: IndustryCodeCondition[] = [];
  private deductibleFormatter: DeductibleFormatter;
  private showALSLimit: boolean = false;
  private ALSLimit: number;
  private deviation: number;
  @ViewChild('sendPdfModal') private sendPdfModal: EmailModalComponent;

  constructor(
    protected router: Router,
    protected toastr: ToastsManager,
    protected translate: TranslateService,
    protected route: ActivatedRoute,
    protected quoteService: QuoteService,
    protected quoteSummaryService: QuoteSummaryService,
    protected industrySearchService: IndustrySearchService,
    protected http: Http,
    protected formBuilder: FormBuilder
  ) {
    super(translate, router);
    this.onSendPdf = this.onSendPdf.bind(this);
    this.deductibleFormatter = new DeductibleFormatter(translate);
  }

  public ngOnInit() {
    this.quoteSummaryForm = this.formBuilder.group({
      deviation: new FormControl('', [NumberRangeValidator(-100, 100)])
    });
    this.quoteService
      .getStatusMap()
      .then(response => {
        if (Object.keys(response).length) {
          this.quoteStatusMap = response;
        }
      })
      .catch(e => {
        this.toastr.error(this.translate.instant('generic.error'));
      });
  }

  public async ngAfterViewInit() {
    let quoteNumber: string;
    this.safeSubscribe(this.route.params).subscribe(
      async (params: Params) => {
        quoteNumber = params['quoteNumber'];
        await this.reloadQuote(quoteNumber);
      }
    );
  }

  public async reloadQuote(quoteNumber: string) {
    const quote = await this.quoteSummaryService.retrieveQuote(quoteNumber);

    try {
      this.quoteNumber = quote.getQuoteId;
      this.quoteStatus = quote.getStatus;
      if (quote.getBusinessInfo) {
        this.businessInfo = quote.getBusinessInfo;
        this.sendPdfModal.setSubject(
          this.translate.instant('summary.sendPdf.defaultValues.subject', {
            namedInsured:
              this.businessInfo.displayBusinessName ||
              this.businessInfo.namedInsured
          })
        );
        this.industrySearchService
          .retrieveIndustryCodeCondition(this.businessInfo.industryCode)
          .then(data => {
            this.industryCodeConditions = data;
          });
        this.sendPdfModal.setRecipient(this.businessInfo.brokerContactEmail);
        this.sendPdfModal.setMessage(
          this.translate.instant('summary.sendPdf.defaultValues.message')
        );
      }
      if (quote.getLob) {
        this.lobCoverageList = quote.getLob;
        this.checkALSLimit();
      }
      if (quote.getDeviation) {
        this.quoteSummaryForm.controls.deviation.setValue(quote.getDeviation);
        this.deviation = quote.getDeviation;
      }
      if (quote.getOriginalTotalPremimum) {
        this.originalTotalPremium = quote.getOriginalTotalPremimum;
        this.calculatedTotalPremium = quote.getDeviatedTotalPremium;
      }
    } catch (e) {
      console.log('Error retrieving quote summary: ', e);
    }
  }

  public getIndustryCodeCondition(): IndustryCodeCondition[] {
    return this.industryCodeConditions;
  }

  public formatDeductibles(coverage: LobCoverage) {
    // If does not even have deductible 1
    if (!coverage.Deductible1) {
      return '';
    }
    // If there is only one deductible.
    if (!coverage.Deductible2) {
      return this.deductibleFormatter.transform(
        coverage.Deductible1,
        coverage.Deductible1Enum.EnumFormat
      );
    }
    // If there are two deductibles
    const deductible1 = this.deductibleFormatter.transform(
      coverage.Deductible1,
      coverage.Deductible1Enum.EnumFormat
    );
    const deductible2 = this.deductibleFormatter.transform(
      coverage.Deductible2,
      coverage.Deductible2Enum.EnumFormat
    );
    if (coverage.CoverageRateCode === 'CGL-00') {
      const pdLabel = this.translate.instant('summary.coverage.deductibles.PD');
      const biLabel = this.translate.instant('summary.coverage.deductibles.BI');
      return `${pdLabel}${deductible1} ${biLabel}${deductible2}`;
    } else {
      return `${deductible1} / ${deductible2}`;
    }
  }

  public onDashboard() {
    this.navigateTo(['/dashboard']);
  }

  public onBind() {
    this.navigateTo(['/bind/'+ this.quoteNumber]);
  }

  public onSendPdf(payload: any) {
    this.quoteSummaryService
      .sendPdf(
        this.quoteNumber,
        payload.subject,
        payload.sender,
        payload.message,
        payload.recipients
      )
      .then((result: any) => {
        this.toastr.success(
          this.translate.instant('summary.sendPdf.result.success')
        );
      })
      .catch(err => {
        this.sendPdfModal.hide();
        this.toastr.error(
          this.translate.instant('summary.sendPdf.result.failure')
        );
      })
      .then(() => {
        if (this.quoteStatus === this.quoteStatusMap['SUMMARIZED']) {
          this.quoteSummaryService
            .retrieveQuote(this.quoteNumber)
            .then((quote: Quote) => {
              this.quoteStatus = quote.getStatus;
            });
        }
      });
    this.sendPdfModal.hide();
  }

  public onRefreshClick(resetValue?: boolean) {
    let deviation = resetValue
      ? 0
      : this.quoteSummaryForm.controls.deviation.value;
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
          this.quoteSummaryForm.controls.deviation.setValue(deviation);
        }
        this.calculatedTotalPremium = roundedOffPremium;
        this.deviation = deviation;
      });
    }
  }

  public onDeviationKeyDown(event) {
    // todo: having keydown interceptor should not be our default way of handling
    // submit, we should have a module for each input that is covered in proper form
    // and rely on form submit.
    if (this.quoteSummaryForm.valid && event.keyCode === 13) {
      this.onRefreshClick();
    }
  }

  protected checkShowDeviation(): boolean {
    const showDeviation = this.calculatedTotalPremium
      ? this.calculatedTotalPremium !== this.originalTotalPremium
      : false;
    this.premiumText = showDeviation
      ? 'generic.premiumDetails.title.newPremium'
      : 'generic.premiumDetails.title.premium';
    return showDeviation;
  }

  protected onBack() {
    this.navigateTo(['/coverageInfo/' + this.quoteNumber]);
  }

  /**
   * Check if coverage which has CoverageRateCode ALS-BI coverage exists in the 'ALS' LOB.
   * If exist, set coverage's CovLimit value to ALS limit which will be shown on page.
   */
  private checkALSLimit() {
    const lobList = this.lobCoverageList;
    let ALSLobIndex = lobList.findIndex(lob => {
      return lob.LOBCode === 'BI';
    });
    if (ALSLobIndex > -1) {
      const covList = lobList[ALSLobIndex].coverageList;
      if (Array.isArray(covList) && covList.length) {
        let covIndex = covList.findIndex(cov => {
          return cov.CoverageRateCode === 'ALS-BI';
        });
        if (covIndex > -1) {
          this.ALSLimit = covList[covIndex].CovLimit;
          this.showALSLimit = true;
        }
      }
    }
  }
}
