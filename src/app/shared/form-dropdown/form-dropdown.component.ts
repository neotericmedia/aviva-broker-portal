import { Component, forwardRef, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseValueAccessor } from '../../base/base-value-accessor.component';

@Component({
  selector: 'form-dropdown',
  templateUrl: './form-dropdown.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    // tslint:disable-next-line:no-forward-ref
    useExisting: forwardRef(() => FormDropdownComponent),
    multi: true
  }]
})
export class FormDropdownComponent extends BaseValueAccessor {
  @Input() private options: any = [];
  @Input() private id: string;
  @Input() private name: string;
  @Input()
  public set value(value) {
    this.onInputChange(value);
  }
  public get value() {
    return this.innerValue;
  }

  private onInputChange(value: any) {
    this.innerValue = value;
    this.onChange(this.innerValue);
    this.onTouched();
  }
}
