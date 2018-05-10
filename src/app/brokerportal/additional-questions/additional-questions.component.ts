import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { CoverageInfoService } from '../../quote/coverageInfo/coverageInfo.service';
import { BusinessInfo, OfferingLOBCoverage, LobQuestionSection, LobQuestion, LobQuestionSubsection } from '../../quote/models';
import { BaseNavComponent } from '../../base';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastsManager } from 'ng2-toastr';
import { TranslateService } from 'ng2-translate';
import { LobQuestionsService } from '../../quote/coverageInfo/lob-questions/lob-questions.service';

@Component({
  selector: 'additional-questions',
  templateUrl: './additional-questions.component.html',
  providers: [
    CoverageInfoService,
    LobQuestionsService
  ]
})

export class AdditionalQuestionsComponent extends BaseNavComponent implements OnInit {
  // TODO pass parent form as input, guard the page when dirty, remove businessInfo input
  @Input() private businessInfo: BusinessInfo;
  @Output() private onClickBack: EventEmitter<boolean> = new EventEmitter();

  private quoteNumber: string;
  private additionalQuestionsForm: FormGroup;
  private isReady: boolean = false;
  private ifShowSpinner: boolean = false;
  private showControlsErrorsIfAny: boolean = false;
  private ifCallFUS: boolean = false;

  // Array of LOB Question Section; used by template
  private lobQuestionSectionList: LobQuestionSection[];
  // The latest answers; used by template
  private lobAnswersHash: any;

  constructor(
    private route: ActivatedRoute,
    protected router: Router,
    private coverageInfoService: CoverageInfoService,
    protected toastr: ToastsManager,
    protected translate: TranslateService,
    private lobQuestionsService: LobQuestionsService,
    private formBuilder: FormBuilder
  ) {
    super();
  }

  public ngOnInit() {
    this.quoteNumber = this.businessInfo.quoteNumber;
    this.additionalQuestionsForm = this.formBuilder.group({});

    const savedLobQAHash = {};
    if (this.businessInfo.lobQuestionAnswers && this.businessInfo.lobQuestionAnswers.length) {
      this.businessInfo.lobQuestionAnswers.forEach(qa => {
        savedLobQAHash[qa.key] = qa;
      });
    }

    // no need to do async here because it is controlled by isReady flag.
    // Load coverage archetypes
    this.loadLobQuestions(savedLobQAHash).then(result => {
      this.isReady = true;
    });
  }

  private async loadLobQuestions(savedLobQAHash: any): Promise<void> {
    this.toggleSpinner();
    let lobs: OfferingLOBCoverage[];
    try {
      // Load archetypes of all LOB
      lobs = await this.coverageInfoService.loadLOBs(this.quoteNumber);
      if (!lobs) {
        this.toggleSpinner();
        this.toastr.error(this.translate.instant('lobCoverage.notifications.loadLOBsError'));
        return;
      }
      // Load archetypes of all LOB Questions
      const lobKeys = lobs.map(lob => {
        return lob.LOBCode;
      });
      let lobQuestions = await this.coverageInfoService.getLobQuestions(lobKeys);
      // Overlay the saved questions onto the archetypes
      this.processLobQuestions(lobQuestions, savedLobQAHash);
    } catch (e) {
      // TODO review error handling
      this.toggleSpinner();
      this.toastr.error(this.translate.instant('lobCoverage.notifications.loadLOBsError'));
      return;
    }
    this.toggleSpinner();
    this.isReady = true;
  }

  private processLobQuestions(lobQuestions: LobQuestion[], savedLobQAHash: any) {
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
        }
        if (question.ID.startsWith('PR-')) {
          // For brokers, only display questions regarding building details
          // (question ID starts with 'PR-) , and intentionally omit
          // FUS related questions (question ID starts with 'FUS-')
          const subsection = lobQHash[lobCode].subsections[0];
          subsection.questions.push(question);
          subsection.initialAnswers.push(savedLobQAHash[question.ID]);
        }
      }
    });
    this.lobQuestionSectionList = [];
    this.lobAnswersHash = {};
    Object.keys(lobQHash).forEach(key => {
      this.lobQuestionSectionList.push(lobQHash[key]);
      this.lobAnswersHash[key] = [];
    });
    if (!this.lobQuestionSectionList.length) {
      this.navigateTo(['broker/summary/' + this.quoteNumber]);
    }
  }

  private toggleSpinner() {
    this.ifShowSpinner = !this.ifShowSpinner;
  }

  private createLobQuestonAnswersRequestData() {
    let requestData = [];
    Object.keys(this.lobAnswersHash).forEach(key => {
      requestData.push(...this.lobAnswersHash[key]);
    });
    return requestData;
  }

  private onBack() {
    this.onClickBack.emit();
  }

  /**
   * Function called when 'Save' or 'Next' Button is clicked.
   */
  private onSave(navigateToNextPage?: boolean): boolean {
    this.showControlsErrorsIfAny = true;
    if (!this.additionalQuestionsForm.invalid) {
      try {
        const requestData = this.createLobQuestonAnswersRequestData();
        this.saveLobQuestionAnswerInfoAndShowToast(requestData, navigateToNextPage);
        return true;
      } catch (e) {
        this.toastr.error(
          this.translate.instant('business.notifications.fieldError'));
        return false;
      }
    } else {
      this.toastr.error(
        this.translate.instant('business.notifications.fieldError'));
    }
    return false;
  }

  /**
   * Function to call the webservice to save LobQuestionAnswers
   * and show toast to highlight success or failure.
   */
  private saveLobQuestionAnswerInfoAndShowToast(requestData: any, navigateToSummary: boolean) {
    this.toggleSpinner();
    try {
      const quoteNumber = this.quoteNumber;
      this.lobQuestionsService.saveLobQuestionAnswers(requestData, this.quoteNumber).then(res => {
        if (res && res.status === 'ok') {
          this.businessInfo.lobQuestionAnswers = requestData;
          this.additionalQuestionsForm.markAsPristine();
          this.toastr.success(this.translate.instant('business.notifications.saveSuccess'));
          if (navigateToSummary) {
            this.navigateTo(['broker/summary/' + quoteNumber]);
          }
        } else if (res.error && res.error.message) {
          this.toastr.error(res.error.message);
        } else {
          throw res;
        }
        this.toggleSpinner();
      })
        .catch(e => {
          this.toastr.error(this.translate.instant('business.notifications.saveError'));
          this.toggleSpinner();
        });
    } catch (e) {
      this.toastr.error(this.translate.instant('business.notifications.saveError'));
      this.toggleSpinner();
    }
  }
}
