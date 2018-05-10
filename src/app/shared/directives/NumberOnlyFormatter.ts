import { Directive, ElementRef, HostListener } from '@angular/core';
import { TranslateService } from 'ng2-translate';
import { BaseFormatter } from '../../base';

@Directive({
  selector: '[number-only-formatter]'
})
export class NumberOnlyFormatterDirective extends BaseFormatter {
  private translate: TranslateService;

  // Allow decimal numbers.
  private regex: RegExp = new RegExp(/^[0-9]+$/g);

  // Allow key codes for special events
  private specialKeys: string[] = [
    'ArrowLeft',
    'ArrowRight',
    'Backspace',
    'Delete',
    'End',
    'Home',
    'Shift',
    'Tab'];

  constructor(private el: ElementRef, translate: TranslateService) {
    super();
    this.translate = translate;
  }

  @HostListener('keyup', ['$event'])
  public onChange(event) {
    let formattedNumber = BaseFormatter.formatNumber(
      String(this.el.nativeElement.value), this.translate.currentLang);
    if (BaseFormatter.hasValue(formattedNumber)) {
      this.el.nativeElement.value = formattedNumber;
    }
  }

  @HostListener('keydown', ['$event'])
  public onKeyDown(event) {
    const e = <KeyboardEvent>event;
    let passthrough = false;
    // Allow some special keys to be used.
    if (this.specialKeys.indexOf(e.key) !== -1) {
      passthrough = true;
    } else if (e.ctrlKey || e.metaKey) {
      // Allow all Ctrl operations, e.g. ctrl + r to refresh browser
      passthrough = true;
    }

    if (passthrough) {
      return;
    }

    let current = this.el.nativeElement.value + '';
    current = current.replace(/\D/g, '');

    const next = current + e.key;
    if (next && !String(next).match(this.regex)) {
      event.preventDefault();
    }

    return;
  }
}
