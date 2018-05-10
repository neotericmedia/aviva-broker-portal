import { Component, Input } from '@angular/core';
import { TranslateService } from 'ng2-translate';

@Component({
  selector: 'accordion-section',
  templateUrl: './accordion-section.component.html'
})
export class AccordionSectionComponent {
  @Input('id') protected id: string = '';
  @Input('groupClass') protected groupClass?: string;
  @Input('isOpen') protected isOpen: boolean = true;
  @Input('title') protected title: string;
  @Input('iconClass') protected iconClass?: string;
  private translate: TranslateService;

  constructor(translate: TranslateService) {
    this.translate = translate;
  }
}
