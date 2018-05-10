import { ValidatorFn, AbstractControl } from '@angular/forms';

/**
 * Custom Validator to check whether control value is within minimum and maximum
 * @param minimum minimum value
 * @param maximum maximum value
 */
export function NumberRangeValidator(minimum: number, maximum: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } => {
    let ctrValue: number;
    if (typeof control.value === 'number') {
      ctrValue = control.value;
    } else {
      ctrValue = parseInt(control.value, 10);
    }
    if (isNaN(ctrValue)) {
      console.log('Error: Control Value is not a number. Exiting limitValidator function.');
      return null;
    }
    if (minimum && ctrValue < minimum) {
      return { lessThanMinimum: minimum };
    }
    if (maximum && ctrValue > maximum) {
      return { greaterThanMaximum: maximum };
    }
    return null;
  };
}
