import * as moment from 'moment';
import { Subject } from 'rxjs';
import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl, ValidatorFn, Validators } from '@angular/forms';
import { TranslateService } from 'ng2-translate';

import { BaseFormComponent } from '../../../base';
import { BusinessDateQuote } from './business-date-quote.model';
import { BusinessInfoService } from '../businessInfo.service';

@Component({
  selector: 'business-date-quote',
  styleUrls: ['../businessInfo.component.scss'],
  templateUrl: './business-date-quote.component.html',
  providers: [BusinessInfoService]
})
export class BusinessDateQuoteComponent extends BaseFormComponent implements OnInit {
  @Input() private dateQuoteInfo: BusinessDateQuote;
  @Input() private businessInfoService: BusinessInfoService;
  @Input() private notifier: Subject<string>;
  @Input() private parentForm: FormGroup;
  private isReady: boolean = false;
  private isCopying: boolean = false;
  private dateQuoteForm: FormGroup;
  private minEffectiveDate: Date;
  private maxEffectiveDate: Date;
  private initEffectiveDate: Date;
  private isQuoteDisabled: boolean = false;
  private formErrors = new FormErrors();

  constructor(
    private formBuilder: FormBuilder,
    protected translate: TranslateService
  ) {
    super(translate);
  }

  public async ngOnInit() {
    this.safeSubscribe(this.notifier).subscribe((event) => {
      if (event === 'copyIsSaved' && !this.isQuoteDisabled && this.isCopying) {
        this.isQuoteDisabled = true;
      } else if (event === 'onSave') {
        this.onValueChanged();
      }
    });

    // Reading quote from business info service
    const quote = await this.businessInfoService.getQuote();
    const businessInfo = quote && quote.getBusinessInfo;
    if (businessInfo) {
      this.dateQuoteInfo.quoteNumber = businessInfo.quoteNumber;
      this.dateQuoteInfo.effectiveDate = new Date(businessInfo.effectiveDate);
      this.dateQuoteInfo.expiryDate = new Date(businessInfo.expiryDate);
    }

    const copyingCheckPromise = this.businessInfoService.isCopyingQuote().then((isCopying) => {
      this.isCopying = isCopying;
      if (this.dateQuoteInfo && this.dateQuoteInfo.quoteNumber) {
        if (!isCopying) {
          this.isQuoteDisabled = true;
          return false;
        } else {
          return true;
        }
      }
      return false;
    });

    // Prepare data for date fields
    if (!this.dateQuoteInfo.effectiveDate) {
      this.dateQuoteInfo.effectiveDate = new Date();
    }
    this.initEffectiveDate = new Date(this.dateQuoteInfo.effectiveDate);
    this.minEffectiveDate = this.initEffectiveDate;
    this.maxEffectiveDate = moment(this.initEffectiveDate).add(3, 'months').toDate();

    if (!this.dateQuoteInfo.expiryDate) {
      this.dateQuoteInfo.expiryDate = moment(new Date()).add(1, 'year').toDate();
    }

    // Create form
    this.dateQuoteForm = this.formBuilder.group({
      effectiveDt: [this.dateQuoteInfo.effectiveDate, [Validators.required]],
      expiryDt: [this.dateQuoteInfo.expiryDate, [Validators.required]],
      quoteNumber: [
        this.dateQuoteInfo.quoteNumber,
        [
          Validators.required,
          Validators.pattern(/^.*[0-9]{8,}.*$/)
        ],
        this.duplicatedQuoteNumberValidator()
      ]
    });
    this.parentForm.addControl('dateQuote', this.dateQuoteForm);

    this.isReady = true;

    // Detect changes on form
    this.safeSubscribe(this.dateQuoteForm.valueChanges)
      .debounceTime(1000)
      .subscribe(data => this.onValueChanged(data));

    copyingCheckPromise.then((result) => {
      // If copying case, perform check immediately
      if (result) {
        this.dateQuoteForm.controls.quoteNumber.updateValueAndValidity();
      }
    });
  }

  private onUpdateEffectiveDate(value) {
    this.dateQuoteInfo.effectiveDate = value;
    this.initEffectiveDate = value;
    this.dateQuoteInfo.expiryDate = moment(value).add(1, 'year').toDate();
  }

  private onValueChanged(data?: any) {
    if (!this.dateQuoteForm) { return; }
    const form = this.dateQuoteForm;
    this.dateQuoteInfo.quoteNumber = form.get('quoteNumber').value;
    Object.keys(this.formErrors).forEach((field) => {
      if (this.formErrors.hasOwnProperty(field)) {
        let errors = this.formErrors[field];
        this.formErrors[field] = [];
        const control = form.get(field);
        if (control && !control.valid) {
          Object.keys(control.errors).forEach((key) => {
            const error = control.errors[key];
            if (error.message) {
              this.formErrors[field].push(error.message);
            } else {
              const message = this.translate.instant('business.details.errors.quoteNumber.' + key);
              this.formErrors[field].push(message);
            }
          });
        }
      }
    });
  }

  /**
   * Custom Validator to check whether quote number exists
   */
  private duplicatedQuoteNumberValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      const quoteNumber: string = control.value.trim();
      const validatorPromise = new Promise((resolve) => {
        // If this quote is disabled, no need to perform any check
        if (this.isQuoteDisabled) {
          resolve();
          return;
        }

        this.businessInfoService.quoteNumberExists(quoteNumber).then(quoteDocs => {
          let isDuplicated = false;
          if (quoteDocs && quoteDocs.length) {
            quoteDocs.some((qd) => {
              if (String(qd._id) === quoteNumber) {
                isDuplicated = true;
                return true;
              }
            });
          }
          if (isDuplicated) {
            const existMessage = this.translate.instant('business.details.errors.quoteNumber.exists', {
              quoteNumbers: quoteDocs.map(qd => {
                return qd._id;
              }).join(', ')
            });
            resolve({
              quoteNumber: {
                duplicated: true,
                value: control.value,
                message: existMessage
              }
            });
          } else {
            resolve();
          }
        })
        .catch((error) => {
          resolve();
        });
      });
      return validatorPromise;
    };
  }
}

class FormErrors {
  public effectiveDt: string[] = [];
  public quoteNumber: string[] = [];
}
