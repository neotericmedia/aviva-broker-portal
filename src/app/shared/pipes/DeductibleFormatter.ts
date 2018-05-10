import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from 'ng2-translate';
import { BaseFormatter } from '../../base';

@Pipe({ name: 'myDeductibleFormatter' })
export class DeductibleFormatter extends BaseFormatter implements PipeTransform {
  private translate: TranslateService;

  constructor(translate: TranslateService) {
    super();
    this.translate = translate;
  }

  public transform(deductible: string | number, format: any): string {
    let result = '';
    if (deductible) {
      if (format === 'D') {
        let formatter = BaseFormatter.getCurrencyFormatter(this.translate.currentLang);
        result = formatter.format(+deductible);
      } else {
        let formatter = BaseFormatter.getPercentFormatter(this.translate.currentLang);
        deductible = +deductible / 100;
        result = formatter.format(deductible);
      }
    }
    return result;
  }
}
