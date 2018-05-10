import {
  AfterViewInit,
  Component,
  ElementRef,
  forwardRef,
  Input,
  ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslateService } from 'ng2-translate';

import { BaseFormatter } from '../../base';

@Component({
  selector: 'number-input',
  templateUrl: './number-input.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    // tslint:disable-next-line:no-forward-ref
    useExisting: forwardRef(() => NumberInputComponent),
    multi: true
  }]
})
export class NumberInputComponent extends BaseFormatter
  implements ControlValueAccessor, AfterViewInit {
  @Input() protected type: string;
  @Input() protected name: string;
  @Input() protected placeholderKey: string;
  @Input() protected disabled: boolean;
  @Input() protected min: string;
  @Input()
  public set value(value) {
    this.onInputChange(value);
  }
  public get value() {
    return this.innerValue;
  }
  @ViewChild('myInput') protected myInput: ElementRef;
  private translate: TranslateService;
  private innerValue: any;

  constructor(translate: TranslateService) {
    super();
    this.translate = translate;
  }

  public ngAfterViewInit() {
    if (BaseFormatter.hasValue(this.innerValue)) {
      // Set by writeValue which is called by FormBuilder init.
      this.myInput.nativeElement.value =
        BaseFormatter.formatNumber(this.innerValue, this.translate.currentLang);
    } else {
      this.myInput.nativeElement.value = '';
    }
  }

  /* ControlValueAccessor Interfaces / Methods */
  public registerOnChange (fn) {
    this.onChange = fn;
  }

  public registerOnTouched(fn) {
    this.onTouched = fn;
  }

  public writeValue(value) {
    // value can be 0
    if (BaseFormatter.hasValue(value)) {
      this.innerValue = BaseFormatter.deformatNumber(value);
    }
  }

  private onChange: any = () => { return; };
  private onTouched: any = () => { return; };
  /* ControlValueAccessor Interfaces / Methods */

  private onInputChange(value) {
    this.innerValue = BaseFormatter.deformatNumber(value);
    this.onChange(this.innerValue);
    this.onTouched();
  }
}
