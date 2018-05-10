import { ValidatorFn, AbstractControl } from '@angular/forms';
import { LobCoverage } from '../../models';
import { CoverageInfoUtils } from '../coverageInfo.utils';
import { CoverageInputValue } from './coverage-input.value';

/**
 * Custom Validator to check whether a coverage input component is valid
 * @param cvg - LOB Coverage
 */
export function CoverageInputValidator(cvg: LobCoverage): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } => {
    const value: CoverageInputValue = control.value;
    if (value.selected) {
      if (CoverageInfoUtils.isSupportedLimitType(cvg) && !value.limit) {
        return {
          limitProvided: false
        };
      }

      if (CoverageInfoUtils.hasDeductible(cvg) && !value.deductible1) {
        return {
          deductible1Provided: false
        };
      }

      if (CoverageInfoUtils.hasTwoDeductibles(cvg) && !value.deductible2) {
        return {
          deductible2Provided: false
        };
      }
    }
    return null;
  };
}
