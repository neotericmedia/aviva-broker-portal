import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from 'ng2-translate';

import { BaseFormatter } from '../../base';

@Component({
  selector: 'input-envelope',
  templateUrl: './input-envelope.component.html'
})
export class InputEnvelopeComponent implements OnInit {
  @Input('type') protected type: string;
  @Input('groupClass') protected groupClass;
  @Input('symbolId') protected symbolId;
  private symbol: string;
  private isSymbolOnRight: boolean = false;
  private translate: TranslateService;

  constructor(translate: TranslateService) {
    this.translate = translate;
  }

  public ngOnInit() {
    switch(this.type) {
      case BaseFormatter.numberFormatTypes.currency:
        this.symbol = '$';
        break;
      case BaseFormatter.numberFormatTypes.percent:
        this.symbol = '%';
        break;
      default:
        break;
    }
    switch(this.translate.currentLang) {
      case 'fr':
        this.isSymbolOnRight = true;
        break;
      default:
        break;
    }
  }
}
