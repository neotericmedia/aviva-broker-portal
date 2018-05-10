import { Http } from '@angular/http';
import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from 'ng2-translate';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

import { QuoteSummaryService } from '../../quote/summary/quote-summary.service';
import { QuoteService } from '../../quote/shared/quote.service';
import { QuoteSummaryComponent } from '../../quote/summary/quote-summary.component';
import {
  QuoteLOBCoverage,
  Quote,
  LobCoverage,
  OfferingLOBCoverage,
  CoverageGroup,
  CoverageRelationship,
  RatabaseZonesResponse,
  CoverageInfoRequest
} from '../../quote/models';

import { CoverageInfoService } from '../../quote/coverageInfo/coverageInfo.service';
import { QuoteSearchService } from '../../quote/search';
import { CoverageInfoUtils } from '../../quote/coverageInfo/coverageInfo.utils';
import { IndustrySearchService } from '../../quote/businessInfo/industry-search/industry-search.service';

@Component({
  selector: 'broker-summary',
  styleUrls: ['./broker-summary.component.scss'],
  templateUrl: './broker-summary.component.html',
  providers: [
    QuoteSummaryService,
    CoverageInfoService,
    QuoteSearchService,
    IndustrySearchService
  ]
})
export class BrokerSummaryComponent extends QuoteSummaryComponent
  implements OnInit {
  public summary: boolean = true;
  public details: boolean = false;
  public covList: any = [
    {
      label: 'Business Contents',
      values: [25000, 35000, 50000]
    },
    {
      label: 'Property Deductible',
      values: [1000, 2500, 5000]
    },
    {
      label: 'Commercial General Liability',
      values: ['2M', '3M', '5M']
    }
  ];
  protected qNumber: string;
  protected premiumValue: any = {};
  private isReady: boolean = false;
  private selectedLob: string;
  private quotePromise: Promise<Quote>;
  private lobs: OfferingLOBCoverage[];
  private mergedLobCvgsHash: any = {};
  private lobDetailsForm: FormGroup;
  private ifShowSpinner: boolean = false;

  constructor(
    protected router: Router,
    protected toastr: ToastsManager,
    protected translate: TranslateService,
    protected route: ActivatedRoute,
    protected quoteService: QuoteService,
    protected quoteSummaryService: QuoteSummaryService,
    protected http: Http,
    protected formBuilder: FormBuilder,
    protected coverageInfoService: CoverageInfoService,
    protected industrySearchService: IndustrySearchService,
    private quoteSearchService: QuoteSearchService
  ) {
    super(
      router,
      toastr,
      translate,
      route,
      quoteService,
      quoteSummaryService,
      industrySearchService,
      http,
      formBuilder
    );
  }

  public async ngOnInit() {
    super.ngOnInit();
    this.lobDetailsForm = new FormGroup({});
    this.quoteSummaryForm.addControl('lobDetails', this.lobDetailsForm);

    this.safeSubscribe(this.route.params).subscribe(async (params: Params) => {
      this.qNumber = params['quoteNumber'];
      await this.reloadQuote(this.qNumber);
    });
  }

  public async reloadQuote(quoteNumber: string) {
    await super.reloadQuote(quoteNumber);
    this.toggleSpinner(true);
    this.isReady = false;
    this.quotePromise = new Promise((resolve, reject) => {
      // Do not toggle spinner within this promise block
      if (!this.qNumber) {
        resolve();
      } else {
        this.quoteSearchService
          .findByQuoteNumber(this.qNumber)
          .then(response => {
            resolve(response);
          })
          .catch(error => {
            reject(error);
          });
      }
    });

    this.quotePromise
      .then(async (quote: Quote) => {
        let lobs: QuoteLOBCoverage[] = quote && quote.getLob;
        if (lobs.find(lob => !lob.coverageList || !lob.coverageList.length)) {
          await this.loadDefaultQuoteCoverages();
          quote = await this.quoteSearchService.findByQuoteNumber(this.qNumber);
          await this.reloadQuote(quote.getQuoteId);
          lobs = quote && quote.getLob;
        }
        const savedLobCvgsHash: any = {};
        if (lobs && lobs.length) {
          lobs.forEach(lob => {
            savedLobCvgsHash[lob.LOBCode] = savedLobCvgsHash[lob.LOBCode] || {};
            const covList = lob.coverageList;
            if (covList && covList.length) {
              covList.forEach(cov => {
                savedLobCvgsHash[lob.LOBCode][
                  `${cov.FormNumber}-${cov.CoverageSequence}`
                ] = cov;
              });
            }
          });
        }
        await this.loadCoverageArchetypes(savedLobCvgsHash);
        this.toggleSpinner();
      })
      .catch(error => {
        this.toastr.error(error.message);
        this.toggleSpinner();
      });
  }

  public async showSummary() {
    await this.reloadQuote(this.qNumber);
    this.summary = true;
    this.details = false;
  }

  public onEditCoverageClick(lobCode) {
    this.summary = false;
    this.details = true;
    this.selectedLob = lobCode;
  }

  public onBind() {
    this.navigateTo(['broker/bind/' + this.quoteNumber]);
  }

  protected onBack() {
    this.navigateTo(['/broker/businessInfo/' + this.qNumber]);
  }

  private toggleSpinner(value?: boolean) {
    this.ifShowSpinner = value;
  }

  private async loadDefaultQuoteCoverages() {
    const requestData: CoverageInfoRequest = new CoverageInfoRequest();
    requestData.loadDefault = true;
    requestData.performRate = true;
    try {
      const res = await this.coverageInfoService.saveCoverageInfo(
        requestData,
        this.qNumber
      );
      if (res && res.error && res.error.message) {
        this.toastr.error(res.error.message);
      } else if (res && res.status !== 'ok') {
        throw res;
      }
    } catch (e) {
      this.toastr.error(
        this.translate.instant('business.notifications.saveError')
      );
    }
  }

  private async loadCoverageArchetypes(savedLobCvgsHash: any): Promise<void> {
    let lobs: OfferingLOBCoverage[];
    try {
      lobs = await this.coverageInfoService.loadLOBs(this.qNumber);
      if (!lobs) {
        // ToDo: if LOB's cannot be retrieved do this...
        return;
      }
      this.lobs = this.mergeOfferingAndSavedCvgs(lobs, savedLobCvgsHash);
    } catch (e) {
      this.toastr.error(
        this.translate.instant('lobCoverage.notifications.loadLOBsError')
      );
      return;
    }
    try {
      let zoneCoverages = await this.coverageInfoService.loadZones(
        this.qNumber
      );
      this.processZoneCoverages(lobs, zoneCoverages);
    } catch (e) {
      this.toastr.error(
        this.translate.instant('lobCoverage.notifications.loadZonesError')
      );
      return;
    }
    this.isReady = true;
  }

  private processZoneCoverages(
    lobs: OfferingLOBCoverage[],
    zoneCoverages: RatabaseZonesResponse[]
  ) {
    if (!zoneCoverages || !zoneCoverages.length) {
      return;
    }
    let zoneCoverageHash = {};
    zoneCoverages.forEach(zone => {
      zoneCoverageHash[zone.coverageCode] = zone;
    });

    lobs.forEach(lob => {
      this.mergedLobCvgsHash[lob.LOBCode].forEach(lobCov => {
        let code = lobCov.CoverageRateCode;
        let matchedZone = zoneCoverageHash[code];
        if (code && matchedZone) {
          lobCov.zoneValue = matchedZone.zoneValue;
          if (
            matchedZone.deductible1Default > -1 &&
            lobCov.Deductible1Required
          ) {
            lobCov.Deductible1Default = matchedZone.deductible1Default.toString();
          }
          if (
            matchedZone.deductible2Default > -1 &&
            lobCov.Deductible2Required
          ) {
            lobCov.Deductible2Default = matchedZone.deductible2Default.toString();
          }
        }
      });
    });
  }

  private mergeOfferingAndSavedCvgs(
    lobs: OfferingLOBCoverage[],
    savedLobCvgsHash: any
  ): OfferingLOBCoverage[] {
    lobs.forEach(lob => {
      const mergedLobCoverages = [] as LobCoverage[];
      this.mergedLobCvgsHash[lob.LOBCode] = mergedLobCoverages;
      const savedLobCvgs = savedLobCvgsHash[lob.LOB.LOBCode];
      const isEdit = Object.keys(savedLobCvgs).length > 0;
      lob.CoverageList.forEach(cvg => {
        const savedCov =
          savedLobCvgs &&
          savedLobCvgs[`${cvg.FormNumber}-${cvg.CoverageSequence}`];
        if (isEdit) {
          if (savedCov) {
            savedCov.isSelected = true;
            mergedLobCoverages.push(savedCov);
          } else {
            mergedLobCoverages.push(cvg);
          }
        } else {
          if (!CoverageInfoUtils.isNotAvailable(cvg)) {
            if (
              CoverageInfoUtils.isMandatory(cvg) ||
              CoverageInfoUtils.isRecommended(cvg) ||
              CoverageInfoUtils.isTitle(cvg)
            ) {
              cvg.isSelected = true;
            }
            mergedLobCoverages.push(cvg);
          }
        }
      });
    });

    return lobs;
  }

  private onSave() {
    const requestData: CoverageInfoRequest = this.createCoverageInfoRequestData();
    this.saveCoverageInfo(requestData);
  }

  private createCoverageInfoRequestData() {
    let requestData: CoverageInfoRequest = new CoverageInfoRequest();
    requestData.coverageDetails = new Array();
    requestData.performRate = true;

    const lobDetailsFormValues = this.lobDetailsForm.value;

    this.lobs.forEach(archetypeLob => {
      const lob: QuoteLOBCoverage = new QuoteLOBCoverage();
      lob.LOBCode = archetypeLob.LOB.LOBCode;
      lob.LegalSystem = archetypeLob.LegalSystem;
      lob.LOBDescription = archetypeLob.LOB.Locale.Title;
      if (archetypeLob.LOBCode === this.selectedLob) {
        // If the lob in the current iteration is the selected lob being edited
        const lobValues = lobDetailsFormValues[lob.LOBCode];
        lob.coverageList = [];
        archetypeLob.CoverageList.forEach((cvg, index) => {
          const lobValue = lobValues[CoverageInfoUtils.getPseudoId(cvg, index)];
          if (lobValue.selected) {
            if (lobValue.limit) {
              cvg.Limit = lobValue.limit;
            }
            if (lobValue.deductible1) {
              cvg.Deductible1 = lobValue.deductible1;
            }
            if (lobValue.deductible2) {
              cvg.Deductible2 = lobValue.deductible2;
            }
            lob.coverageList.push(cvg);
          }
        });
      } else {
        lob.coverageList = this.mergedLobCvgsHash[lob.LOBCode].filter(cvg => {
          return cvg.isSelected;
        });
      }
      requestData.coverageDetails.push(lob);
    });
    return requestData;
  }

  /**
   * Function to initiate a webservice call to save coverage info and to request rate premimums
   * If the call is successful, the summary page will be loaded.
   * @param requestData
   * @param navigateToSummary
   */
  private saveCoverageInfo(requestData: any) {
    this.toggleSpinner();
    try {
      this.coverageInfoService
        .saveCoverageInfo(requestData, this.qNumber)
        .then(async res => {
          if (res && res.status === 'ok') {
            this.quoteSummaryForm.markAsPristine();
            this.toastr.success(
              this.translate.instant('business.notifications.saveSuccess')
            );
            await this.showSummary();
          } else if (res.error && res.error.message) {
            this.toastr.error(res.error.message);
          } else {
            throw res;
          }
        })
        .catch(e => {
          this.toastr.error(
            this.translate.instant('business.notifications.saveError')
          );
          this.toggleSpinner();
        });
    } catch (e) {
      this.toastr.error(
        this.translate.instant('business.notifications.saveError')
      );
      this.toggleSpinner();
    }
  }
}
