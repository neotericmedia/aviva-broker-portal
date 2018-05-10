import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { TranslateService } from 'ng2-translate';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  Validators
} from '@angular/forms';

import { LobCoverage } from '../../models';
import { BaseFormatter, BaseValueAccessor } from '../../../base';
import { NumberRangeValidator } from '../../../shared/validation/numberRangeValidator.ts';
import { CoverageInfoUtils } from '../coverageInfo.utils';
import { CoverageInputValue } from './coverage-input.value';

@Component({
  selector: 'coverage-input',
  templateUrl: './coverage-input.component.html',
  styleUrls: ['./coverage-input.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    // tslint:disable-next-line:no-forward-ref
    useExisting: forwardRef(() => CoverageInputComponent),
    multi: true
  }]
})
export class CoverageInputComponent extends BaseValueAccessor implements OnInit {
  @Input() private cvg: LobCoverage;
  @Input() private myFormControl: FormControl;
  @Input()
  public set value(value) {
    this.onInputChange(value);
  }
  public get value() {
    return this.innerValue;
  }
  private covInputForm: FormGroup;
  private limitControl: FormControl;
  private deductible1Control: FormControl;
  private deductible2Control: FormControl;
  private hasLabel: boolean = false;
  private propertyDamageLabel: string = 'PD';
  private bodilyInjuryLabel: string = 'BI';
  private formNumber: string;
  private covSeq: string;
  private isCoverageProhibited: boolean = false;
  private isMandatory: boolean = false;
  private isTitle: boolean = false;
  private hasDeductible: boolean = false;
  private hasTwoDeductibles: boolean = false;
  private objectKeys = Object.keys;
  private relationshipErrorMsg: string;

  constructor(
    private formBuilder: FormBuilder,
    private translate: TranslateService
  ) {
    super();
    this.innerValue = new CoverageInputValue();
  }

  public ngOnInit() {
    this.hasDeductible = CoverageInfoUtils.hasDeductible(this.cvg);
    this.hasTwoDeductibles = CoverageInfoUtils.hasTwoDeductibles(this.cvg);
    this.hasLabel = CoverageInfoUtils.isCgl00RateCode(this.cvg);
    this.formNumber = this.cvg.FormNumber;
    this.covSeq = this.cvg.CoverageSequence;
    this.isCoverageProhibited = CoverageInfoUtils.isNotAvailable(this.cvg);
    this.isMandatory = CoverageInfoUtils.isMandatory(this.cvg)  || CoverageInfoUtils.isOptionalityMandatory(this.cvg);
    this.isTitle = CoverageInfoUtils.isTitle(this.cvg);
    this.safeSubscribe(this.myFormControl.statusChanges)
      .subscribe(data => this.onStatusChanged(data));
  }

  public writeValue(value) {
    const isDifferent: boolean = !this.innerValue.isEqual(value);
    super.writeValue(value);
    if (!this.covInputForm) {
      this.buildForm();
    } else {
      this.updateInputFields();
      if (isDifferent) {
        this.onInputChange(this.innerValue);
      }
    }
  }

  private buildForm() {
    this.covInputForm = this.formBuilder.group({});
    const isSelected = this.innerValue.selected;

    // Limit
    if (CoverageInfoUtils.isSupportedLimitType(this.cvg)) {
      const limit = this.innerValue.limit;
      let isDisabled = !isSelected;
      const validators: any[] = [Validators.required];
      if (limit) {
        if (this.isLimitValueLocked()) {
          isDisabled = true;
        } else {
          if (this.cvg.MinimumLimit || this.cvg.MaximumLimit) {
            let minLimit = +this.cvg.MinimumLimit;
            minLimit = isNaN(minLimit) ? null : minLimit;
            let maxLimit = +this.cvg.MaximumLimit;
            maxLimit = isNaN(maxLimit) ? null : maxLimit;
            validators.push(NumberRangeValidator(minLimit, maxLimit));
          }
        }
      }
      this.limitControl = new FormControl({
        value: this.innerValue.limit,
        disabled: isDisabled
      }, validators);
      this.covInputForm.addControl('limit', this.limitControl);
    }

    // Deductible 1
    if (this.hasDeductible) {
      this.deductible1Control = new FormControl({
        value: this.innerValue.deductible1,
        disabled: !isSelected
      }, Validators.required);
      this.covInputForm.addControl('deductible1', this.deductible1Control);
    }

    // Deductible 2
    if (this.hasTwoDeductibles) {
      this.deductible2Control = new FormControl({
        value: this.innerValue.deductible2,
        disabled: !isSelected
      }, Validators.required);
      this.covInputForm.addControl('deductible2', this.deductible2Control);
    }
  }

  private isLimitValueLocked() {
    const limit = this.innerValue.limit;
    return limit && limit === this.cvg.MinimumLimit && limit === this.cvg.MaximumLimit;
  }

  private onInputChange(value) {
    this.innerValue = value;
    this.onChange(this.innerValue);
  }

  private onStatusChanged(status) {
    if (status === 'INVALID') {
      const errors = this.myFormControl.errors;
      let isRelationshipErrorFound = false;
      Object.keys(errors).forEach(errorKey => {
        const errorObj = errors[errorKey];
        const errorType = errorObj.type;
        const errorParams = errorObj.groups;
        if (errorType === 'cmGroupsFailure' || errorType === 'ceGroupsFailure' ||
          errorType === 'cdGroupsFailure' || errorType === 'meGroupsFailure' ||
          errorType === 'nonEmptyGroupsFailure'
        ) {
          this.relationshipErrorMsg =
            this.translate.instant(`lobCoverage.coverage.relationship.${errorType}`, {
              coverages: errorParams.join(', ')
            });
          isRelationshipErrorFound = true;
        } else if (errorType === 'ppGroupsFailure') {
          this.relationshipErrorMsg =
            this.translate.instant(`lobCoverage.coverage.relationship.${errorType}`, {
              childCoverage: errorObj.childName,
              coverages: errorParams.join(', ')
            });
          isRelationshipErrorFound = true;
        }
      });
      if (!isRelationshipErrorFound) {
        delete this.relationshipErrorMsg;
      }
    } else {
      delete this.relationshipErrorMsg;
    }
  }

  private onSelect() {
    this.innerValue.selected = !this.innerValue.selected;
    this.updateInputFields();
    this.onInputChange(this.innerValue);
  }

  private updateInputFields() {
    if (this.innerValue.selected) {
      if (this.limitControl) {
        if (this.isLimitValueLocked()) {
          this.limitControl.disable();
        } else {
          this.limitControl.enable();
        }
      }
      if (this.deductible1Control) {
        this.deductible1Control.enable();
      }
      if (this.deductible2Control) {
        this.deductible2Control.enable();
      }
    } else {
      if (this.limitControl) {
        this.limitControl.disable();
      }
      if (this.deductible1Control) {
        this.deductible1Control.disable();
      }
      if (this.deductible2Control) {
        this.deductible2Control.disable();
      }
    }
  }

  private onUpdateLimit() {
    if (this.limitControl) {
      this.innerValue.limit = this.limitControl.value;
      this.onInputChange(this.innerValue);
    }
  }

  private onUpdateDeductible1(value: string) {
    this.innerValue.deductible1 = value;
    this.onInputChange(this.innerValue);
  }

  private onUpdateDeductible2(value: string) {
    this.innerValue.deductible2 = value;
    this.onInputChange(this.innerValue);
  }

  private isLimitEmptyOptionSelected(): boolean {
    return !this.innerValue.limit;
  }

  private isDeductible1EmptyOptionSelected(): boolean {
    return !this.innerValue.deductible1;
  }

  private isDeductible2EmptyOptionSelected(): boolean {
    return !this.innerValue.deductible2;
  }

  private isLimitOptionSelected(value: string) {
    return value === this.innerValue.limit;
  }

  private isDeductible1OptionSelected(value: string) {
    return value === this.innerValue.deductible1;
  }

  private isDeductible2OptionSelected(value: string) {
    return value === this.innerValue.deductible2;
  }

  private getDeductibleValueFormat(type: string): string | undefined {
    if (type === 'P') {
      return BaseFormatter.numberFormatTypes.percent;
    } else if (type === 'D') {
      return BaseFormatter.numberFormatTypes.currency;
    }
  }

  private getInfo(): string {
    if (this.isTitle) {
      return this.translate.instant('lobCoverage.coverage.tooltip.titleCoverage');
    } else if (this.myFormControl.disabled) {
      return this.translate.instant('lobCoverage.coverage.tooltip.associatedCoverage');
    } else {
      return '';
    }
  }
}
