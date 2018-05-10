import { Component, OnInit, ViewChild } from '@angular/core';
import { Http } from '@angular/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { deserialize } from 'serializer.ts/Serializer';
import { TranslateService } from 'ng2-translate';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

import { BaseNavComponent } from '../../base';
import { DeactivateGuardInterface } from '../../routing/authentication/deactivate-guard.interface';
import {
  CoverageGroup,
  CoverageInfoRequest,
  LobCoverage,
  LobQuestion,
  LobQuestionSection,
  LobQuestionSubsection,
  OfferingLOBCoverage,
  Quote,
  QuoteLOBCoverage,
  RatabaseZonesResponse
} from '../models';
import { CoverageInfoService } from './coverageInfo.service';
import { CoverageInfoUtils } from './coverageInfo.utils';
import { QuoteSearchService } from '../search';

@Component({
  selector: 'coverageInfo',
  styleUrls: ['./coverageInfo.component.scss'],
  templateUrl: './coverageInfo.component.html',
  providers: [
    CoverageInfoService,
    QuoteSearchService
  ]
})
export class CoverageInfoComponent extends BaseNavComponent
  implements OnInit, DeactivateGuardInterface {
  @ViewChild('guardModal') private guardModal;
  private ifShowSpinner: boolean = false;
  private isReady: boolean = false;
  private coverageInfoForm: FormGroup;
  private lobs: OfferingLOBCoverage[];
  private quotePromise: Promise<Quote>;
  private quoteNumber: string;
  private ifCallFUS: boolean = true;

  // Hash of merged offering lob coverages and saved lob coverages; used by template
  private mergedLobCvgsHash: any = {};
  // Array of LOB Question Section; used by template
  private lobQuestionSectionList: LobQuestionSection[];
  // The latest answers; used by template
  private lobAnswersHash: any;

  private showControlsErrorsIfAny: boolean = false;

  constructor(
    protected router: Router,
    protected toastr: ToastsManager,
    protected translate: TranslateService,
    private route: ActivatedRoute,
    private coverageInfoService: CoverageInfoService,
    private quoteSearchService: QuoteSearchService,
    private http: Http,
    private formBuilder: FormBuilder
  ) {
    super(router);
  }

  public ngOnInit() {
    this.coverageInfoForm = this.formBuilder.group({
      lobDetails: new FormGroup({}),
      lobQuestions: new FormGroup({})
    });

    this.safeSubscribe(this.route.params).subscribe((params: Params) => {
      this.quoteNumber = params['quoteNumber'];
      this.quotePromise = new Promise((resolve, reject) => {
        if (!this.quoteNumber) {
          resolve();
        } else {
          this.quoteSearchService.findByQuoteNumber(this.quoteNumber).then(response => {
            resolve(response);
          }).catch(error => {
            reject(error);
          });
        }
      });

      this.quotePromise.then((quote: Quote) => {
        // Process LOB selections
        const lobs: QuoteLOBCoverage[] = quote && quote.getLob;
        // Coverage selections and values previously persisted within quote
        const savedLobCvgsHash: any = {};
        if (lobs && lobs.length) {
          lobs.forEach(lob => {
            savedLobCvgsHash[lob.LOBCode] = savedLobCvgsHash[lob.LOBCode] || {};
            const covList = lob.coverageList;
            if (covList && covList.length) {
              covList.forEach(cov => {
                savedLobCvgsHash[lob.LOBCode][`${cov.FormNumber}-${cov.CoverageSequence}`] = cov;
              });
            }
          });
        }

        // Process LOB Questions
        const bizInfo = quote && quote.getBusinessInfo;
        const lobQAs = bizInfo && bizInfo.lobQuestionAnswers;
        const savedLobQAHash = {};
        if (lobQAs && lobQAs.length) {
          lobQAs.forEach(qa => {
            savedLobQAHash[qa.key] = qa;
          });
        }

        // no need to do async here because it is controlled by isReady flag.
        // Load coverage archetypes
        this.loadCoverageArchetypes(savedLobCvgsHash, savedLobQAHash);
      }).catch(error => {
        this.toastr.error(error.message);
      });
    });
  }

  public canDeactivate(): Promise<boolean> {
    if (!(this.coverageInfoForm && !this.coverageInfoForm.pristine)) {
      return Promise.resolve(true);
    } else {
      return this.guardModal.show();
    }
  }

  private async loadCoverageArchetypes(savedLobCvgsHash: any, savedLobQAHash: any): Promise<void> {
    this.toggleSpinner();
    let lobs: OfferingLOBCoverage[];
    try {
      // Load archetypes of all LOB and coverages
      lobs = await this.coverageInfoService.loadLOBs(this.quoteNumber);
      if (!lobs) {
        this.lobs = [];
        this.toggleSpinner();
        return;
      }
      // Overlay the saved coverages onto the archetypes
      this.mergeOfferingAndSavedCvgs(lobs, savedLobCvgsHash);

      // Load archetypes of all LOB Questions
      const lobKeys = lobs.map(lob => {
        return lob.LOBCode;
      });
      let lobQuestions = await this.coverageInfoService.getLobQuestions(lobKeys);
      // Overlay the saved questions onto the archetypes
      this.processLobQuestions(lobKeys, lobQuestions, savedLobQAHash);
    } catch (e) {
      this.toggleSpinner();
      this.toastr.error(this.translate.instant('lobCoverage.notifications.loadLOBsError'));
      return;
    }

    // Load zone coverages
    try {
      let zoneCoverages = await this.coverageInfoService.loadZones(this.quoteNumber);
      this.processZoneCoverages(lobs, zoneCoverages);
    } catch (e) {
      this.toggleSpinner();
      this.toastr.error(this.translate.instant('lobCoverage.notifications.loadZonesError'));
      return;
    }

    this.toggleSpinner();
    this.isReady = true;
  }

  /**
   * Remove coverages whose field Existence has calue 'Not Available',
   * and initialize lob coverage lists for new quote or saved quote
   * @param lobs: List of archetype LOBs including their offering coverages
   * @param savedLobCvgsHash: Hash of all LOB coverages persisted/recalled in the quote
   */
  private mergeOfferingAndSavedCvgs(lobs: OfferingLOBCoverage[], savedLobCvgsHash: any) {
    lobs.forEach(lob => {
      // Perform merge operations
      const mergedLobCoverages = [] as LobCoverage[];
      this.mergedLobCvgsHash[lob.LOBCode] = mergedLobCoverages;
      const savedLobCvgs = savedLobCvgsHash[lob.LOB.LOBCode];
      const isEdit = Object.keys(savedLobCvgs).length > 0;
      lob.CoverageList.forEach(cvg => {
        const savedCov = savedLobCvgs && savedLobCvgs[`${cvg.FormNumber}-${cvg.CoverageSequence}`];
        if (isEdit) { // If editing quote
          if (savedCov) {
            savedCov.isSelected = true;
            // Push saved coverage to coverage list to recall user inputs
            mergedLobCoverages.push(savedCov);
          } else {
            mergedLobCoverages.push(cvg);
          }
        } else { // If creating quote
          // Based on Catalyst Product Model Version 1.15, there is no coverage whose field Existence
          // has value 'N'(Not Available'). But we keep the if check in case of future changes.
          if (!CoverageInfoUtils.isNotAvailable(cvg)) {
            if (CoverageInfoUtils.isMandatory(cvg) || CoverageInfoUtils.isRecommended(cvg) ||
              CoverageInfoUtils.isTitle(cvg)
            ) {
              cvg.isSelected = true;
            }
            mergedLobCoverages.push(cvg);
          }
        }
      });
    });

    this.lobs = lobs;
  }

  private processLobQuestions(lobKeys: string[], lobQuestions: LobQuestion[], savedLobQAHash: any) {
    if (!lobQuestions) {
      return;
    }
    let lobQHash = {};
    lobQuestions.forEach((question) => {
      if (!question.FormType) {
        return;
      }
      if (!Array.isArray(question.LOBCodes)) {
        return;
      }
      if (question.LOBCodes.indexOf('BI') >= 0) {
        const lobCode = 'BI';
        if (!lobQHash[lobCode]) {
          lobQHash[lobCode] = new LobQuestionSection(lobCode, question);
        }
        const subsection = lobQHash[lobCode].subsections[0];
        subsection.questions.push(question);
        subsection.initialAnswers.push(savedLobQAHash[question.ID]);
      } else if (question.LOBCodes.indexOf('PR') >= 0) {
        const lobCode = 'PR';
        if (!lobQHash[lobCode]) {
          lobQHash[lobCode] = new LobQuestionSection(lobCode, question);
          // PR needs 2 sections for normal questions and FUS questions
          const fusSection = new LobQuestionSubsection();
          fusSection.title = 'lobCoverage.coverage.title.fus.headTitle';
          fusSection.asyncTask = this.coverageInfoService.getFUS(this.quoteNumber);
          lobQHash[lobCode].subsections.push(fusSection);
        }
        const numSection: number = question.ID.startsWith('FUS-') ? 1 : 0;
        const subsection = lobQHash[lobCode].subsections[numSection];
        subsection.questions.push(question);
        subsection.initialAnswers.push(savedLobQAHash[question.ID]);
      }
    });
    this.lobQuestionSectionList = [];
    this.lobAnswersHash = {};
    Object.keys(lobQHash).forEach(key => {
      this.lobQuestionSectionList.push(lobQHash[key]);
      this.lobAnswersHash[key] = [];
    });
  }

  private processZoneCoverages(lobs: OfferingLOBCoverage[], zoneCoverages: RatabaseZonesResponse[]) {
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
          if (matchedZone.deductible1Default > -1 && lobCov.Deductible1Required) {
            lobCov.Deductible1Default = matchedZone.deductible1Default.toString();
          }
          if (matchedZone.deductible2Default > -1 && lobCov.Deductible2Required) {
            lobCov.Deductible2Default = matchedZone.deductible2Default.toString();
          }
        }
      });
    });
  }

  private validateForm(): boolean {
    let result: boolean = true;
    let coveragesInvalid = false;

    // Check if any LOB is invalid. Error should be shown by respective fields.
    const lobDetailsForm = this.coverageInfoForm.get('lobDetails');
    if (lobDetailsForm.invalid) {
      this.toastr.error(
        this.translate.instant('lobCoverage.coverage.errors.lob'),
        null,
        { toastLife: 5000 }
      );
      return false;
    }

    // Check if LOB questions are valid
    const lobQuestionsForm = this.coverageInfoForm.get('lobQuestions');
    if (lobQuestionsForm.invalid) {
      this.toastr.error(
        this.translate.instant('lobCoverage.lobQuestions.errors.lobQuestions'),
        null,
        { toastLife: 5000 }
      );
      return false;
    }

    return true;
  }

  private onBack() {
    this.navigateTo(['/quote/' + this.quoteNumber]);
  }

  private onSave(isNext?: boolean) {
    this.showControlsErrorsIfAny = true;

    if (this.validateForm() === false) {
      return;
    }
    const requestData: CoverageInfoRequest = this.createCoverageInfoRequestData(isNext);
    this.saveCoverageInfo(requestData, isNext);
  }

  private onNext() {
    this.onSave(true);
  }

  /**
   * Function to create coverage info request
   * for webservice call to save coverage info.
   */
  private createCoverageInfoRequestData(performRate?: boolean) {
    let requestData: CoverageInfoRequest = new CoverageInfoRequest();
    requestData.coverageDetails = new Array();
    requestData.performRate = performRate;

    const lobDetailsForm = this.coverageInfoForm.get('lobDetails');
    const lobDetailsFormValues = lobDetailsForm.value;
    this.lobs.forEach(archetypeLob => {
      const lob: QuoteLOBCoverage = new QuoteLOBCoverage();
      lob.LOBCode = archetypeLob.LOB.LOBCode;
      lob.LegalSystem = archetypeLob.LegalSystem;
      lob.LOBDescription = archetypeLob.LOB.Locale.Title;

      const lobValues = lobDetailsFormValues[lob.LOBCode];
      lob.coverageList = [];
      archetypeLob.CoverageList.forEach((cvg, index) => {
        const lobValue = lobValues[CoverageInfoUtils.getPseudoId(cvg, index)];
        if (lobValue && lobValue.selected) {
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
      requestData.coverageDetails.push(lob);
    });

    requestData.lobQuestionAnswers = [];
    Object.keys(this.lobAnswersHash).forEach(key => {
      requestData.lobQuestionAnswers =
        requestData.lobQuestionAnswers.concat(this.lobAnswersHash[key]);
    });

    return requestData;
  }

  /**
   * Function to initiate a webservice call to save coverage info and to request rate premimums
   * If the call is successful, the summary page will be loaded.
   * @param requestData
   * @param navigateToSummary
   */
  private saveCoverageInfo(requestData: any, navigateToSummary: boolean) {
    this.toggleSpinner();
    try {
      this.coverageInfoService.saveCoverageInfo(requestData, this.quoteNumber).then(res => {
        if (res && res.status === 'ok') {
          this.coverageInfoForm.markAsPristine();
          this.toastr.success(this.translate.instant('business.notifications.saveSuccess'));
          if (navigateToSummary === true) {
            this.navigateTo(['/summary/' + this.quoteNumber]);
          }
        } else if (res.error && res.error.message) {
          this.toastr.error(res.error.message);
        } else {
          throw res;
        }
        this.toggleSpinner();
      }).catch(e => {
        this.toastr.error(this.translate.instant('business.notifications.saveError'));
        this.toggleSpinner();
      });
    } catch (e) {
      this.toastr.error(this.translate.instant('business.notifications.saveError'));
      this.toggleSpinner();
    }
  }

  private toggleSpinner() {
    this.ifShowSpinner = !this.ifShowSpinner;
  }
}
