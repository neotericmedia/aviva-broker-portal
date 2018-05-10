import { ControlValueAccessor } from '@angular/forms';
import { BaseComponent } from './base.component';

export class BaseValueAccessor extends BaseComponent implements ControlValueAccessor {
  protected innerValue: any;

  /* ControlValueAccessor Interfaces / Methods */
  public registerOnChange (fn) {
    this.onChange = fn;
  }

  public registerOnTouched(fn) {
    this.onTouched = fn;
  }

  // This in almost all cases need to be overwritten by class being extended.
  public writeValue(value) {
    this.innerValue = value;
  }

  protected onChange: any = () => { return; };
  protected onTouched: any = () => { return; };
  /* ControlValueAccessor Interfaces / Methods */
}
