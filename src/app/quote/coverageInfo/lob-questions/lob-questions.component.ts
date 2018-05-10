import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { TranslateService } from 'ng2-translate';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

import { BaseFormatter, BaseComponent } from '../../../base';
import {
  LobQuestionSubsection,
  LobQuestion,
  LobAnswer,
  LobAnswerLocale,
  LobAnswerOption,
  LobAnswerOptionLocale,
  LobQuestionAnswerType,
  LobQuestionFormType
} from '../../models';

@Component({
  selector: 'lob-questions',
  styleUrls: ['./lob-questions.component.scss'],
  templateUrl: './lob-questions.component.html'
})
export class LobQuestionsComponent extends BaseComponent implements OnInit, OnChanges {
  @Input() private parentForm: FormGroup;
  @Input() private lobAnswers: LobAnswer[] = [];
  @Input() private lobCode: string;
  @Input() private lobSubsections: LobQuestionSubsection[];
  @Input() private ifCallFUS: boolean;
  @Input() private showErrors: boolean;

  private lobQuestionsForm: FormGroup;
  private readonly fieldsAlias = {
    territoryGrade: 'FUS-1',
    townGrade: 'FUS-2',
    yearBuilt: 'PR-1',
    storeys: 'PR-2',
    constructionCode: 'PR-3'
  };

  constructor(
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private toastr: ToastsManager
  ) {
    super();
  }

  public ngOnChanges() {
    this.processQuestions();
  }

  public ngOnInit() {
    this.buildForm();
    // Detect changes on form
    this.safeSubscribe(this.lobQuestionsForm.valueChanges)
      .debounceTime(1000)
      .subscribe(data => this.onValueChanged(data));
    // Only call FUS/building details service from UI in underwriter portal
    if (this.ifCallFUS) {
      this.fillDefaultAnswers();
    }
  }

  private buildForm() {
    const formFields = {};
    if (this.lobSubsections && this.lobSubsections.length) {
      this.lobSubsections.forEach(section => {
        if (section.questions && section.questions.length) {
          section.questions.reduce((result: any, question: LobQuestion, index: number) => {
            const answer = new LobAnswer();
            answer.lobCode = this.lobCode;
            answer.key = question.ID;
            answer.ratabaseField = question.RatabaseField;
            answer.Locale = new LobAnswerLocale();
            answer.Locale.FormField = question.Locale.FormField;
            const answerObj = section.initialAnswers[index];
            let answerVal = '';
            if (answerObj) {
              answerVal = answerObj.value;
            }
            answer.value = answerVal;
            this.lobAnswers.push(answer);

            if (this.fieldsAlias.yearBuilt === question.ID) {
              result[question.ID] = [answerVal,
                [Validators.required, Validators.maxLength(4), Validators.minLength(4)]
              ];
            } else {
              result[question.ID] = [answerVal, [Validators.required]];
            }
            return result;
          }, formFields);
        }
      });
      this.lobQuestionsForm = this.formBuilder.group(formFields);
      this.parentForm.addControl(`lobQuestions${this.lobCode}`, this.lobQuestionsForm);
    }
  }

  private onValueChanged(data?: any) {
    if (!this.lobQuestionsForm) { return; }
    this.lobAnswers.forEach(answer => {
      answer.value = data[answer.key];
    });
  }

  /**
   * Call FUS/iClarify to populate building details fields.
   * The call is considerd successful if at least one of these fields
   * (territoryGrade, townGrade, yearBuilt, storeys, constructionCode) has valid value.
   * Upon a successful call, a toast message indicates what fields are returned and
   * the all these 5 input fields are populated with the returned values.
   * Otherwise, an error toast message shows.
   */
  private fillDefaultAnswers() {
    if (!this.lobQuestionsForm) {
      return;
    }
    if (this.lobSubsections && this.lobSubsections.length) {
      this.lobSubsections.forEach(section => {
        if (section.asyncTask) {
          this.toastr.info(
            this.translate.instant('lobCoverage.lobQuestions.asyncTask.pendingFUS'), null, { dismiss: 'controlled' }
          ).then(toast => {
            section.asyncTask.then(rsp => {
              this.toastr.dismissToast(toast);
              if (rsp) {
                let retrievedFields: string[] = [];
                if (rsp.territoryGrade || rsp.townGrade || rsp.yearBuilt || rsp.storeys || rsp.constructionCode) {
                  Object.keys(rsp).forEach(property => {
                    if (rsp[property]) {
                      retrievedFields.push(
                        this.translate.instant(`lobCoverage.lobQuestions.fieldsTranslate.${property}`));
                      const field = this.lobQuestionsForm.controls[this.fieldsAlias[property]];
                      if (field && !field.value) {
                        field.setValue(rsp[property]);
                      }
                    }
                  });
                  const successFus = this.translate.instant('lobCoverage.lobQuestions.asyncTask.successFUS');
                  const messageList = retrievedFields.map(field => {
                    return `<li>${field}</li>`;
                  }).join('');
                  const message = `<h5><strong>${successFus}</strong></h5><ul>${messageList}</ul>`;
                  this.toastr.success(message, null, { enableHTML: true, toastLife: 10000 });
                } else {
                  this.showFUSErrorToast();
                }
              } else {
                this.showFUSErrorToast();
              }
            }).catch(e => {
              this.toastr.dismissToast(toast);
              this.showFUSErrorToast();
            });
          });
        }
      });
    }
  }

  private showFUSErrorToast() {
    this.toastr.error(
      this.translate.instant('lobCoverage.lobQuestions.asyncTask.failureFUS'),
      null,
      { toastLife: 5000 });
  }

  private processQuestions() {
    if (this.lobSubsections && this.lobSubsections.length) {
      this.lobSubsections.forEach((section, index) => {
        if (section.questions && section.questions.length) {
          section.questions.forEach(question => {
            if (this.isFormDropdown(question.FormType) && this.isAnswerRangeDigit(question.AnswerType) &&
              question.AnswerEnum && question.AnswerEnum.min && question.AnswerEnum.max) {
              const min = question.AnswerEnum.min;
              const max = question.AnswerEnum.max;
              question['answerOptions'] = [];
              for (let i = min; i <= max; i++) {
                const answer = new LobAnswerOption();
                answer.id = i;
                answer.Locale = new LobAnswerOptionLocale();
                answer.Locale.Label = i;
                question['answerOptions'].push(answer);
              }
            } else {
              question['answerOptions'] = question.AnswerEnum;
            }
          });
        }
      });
    }
  }

  private getInputType(answerType: string): string {
    switch (answerType) {
      case String(LobQuestionAnswerType.D):
      case String(LobQuestionAnswerType.P):
      case String(LobQuestionAnswerType.CR):
        return 'number';
      default:
        return 'text';
    }
  }

  private getNumberInputFormat(answerType: string): string | undefined {
    if (answerType === String(LobQuestionAnswerType.CR)) {
      return BaseFormatter.numberFormatTypes.currency;
    } else if (answerType === String(LobQuestionAnswerType.P)) {
      return BaseFormatter.numberFormatTypes.percent;
    }
  }

  private isAnswerRangeDigit(answerType: string): boolean {
    return answerType === String(LobQuestionAnswerType.RD);
  }

  private isFormFreeForm(formType: string): boolean {
    return formType === String(LobQuestionFormType.FF);
  }

  private isFormDropdown(formType: string): boolean {
    return formType === String(LobQuestionFormType.DL);
  }
}
