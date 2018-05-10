import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from 'ng2-translate';
import { BaseFormatter } from '../../base';

@Pipe({ name: 'myNumberFormatter' })
export class NumberFormatter extends BaseFormatter implements PipeTransform  {
  private translate: TranslateService;

  constructor(translate: TranslateService) {
    super();
    this.translate = translate;
  }

  public transform(value: string | number, format: any): string {
    let result = '';
    if (!value || value === 0) {
      value = '0';
    }
    if (value) {
      if (format === BaseFormatter.numberFormatTypes.currency) {
        let formatter = BaseFormatter.getCurrencyFormatter(this.translate.currentLang);
        result = formatter.format(+value);
      } else if (format === BaseFormatter.numberFormatTypes.percent) {
        let formatter = BaseFormatter.getPercentFormatter(this.translate.currentLang);
        value = +value / 100;
        result = formatter.format(value);
      } else if (format === BaseFormatter.numberFormatTypes.decimal) {
        let formatter = BaseFormatter.getDecimalFormatter(this.translate.currentLang);
        result = formatter.format(+value);
      }
    }
    return result;
  }
}
