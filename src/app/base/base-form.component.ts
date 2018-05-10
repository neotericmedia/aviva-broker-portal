import * as moment from 'moment';
import { Router } from '@angular/router';
import { TranslateService } from 'ng2-translate';
import { BsDatepickerConfig  } from 'ngx-bootstrap/datepicker';
import { BaseNavComponent } from './base-nav.component';

export class BaseFormComponent extends BaseNavComponent {
  protected bsDatepickerConfig: Partial<BsDatepickerConfig>;
  protected moment: any;

  constructor(
    protected translate: TranslateService,
    protected router?: Router
  ) {
    super(router);
    this.moment = moment;
    this.bsDatepickerConfig = {
      dateInputFormat: 'll',
      containerClass: 'theme-default',
      showWeekNumbers: false
    };
  }

  protected formatDate(date: Date) {
    return moment(date).format('ll');
  }

  protected formatDateTime(date: Date) {
    return moment(date).format('lll');
  }
}
