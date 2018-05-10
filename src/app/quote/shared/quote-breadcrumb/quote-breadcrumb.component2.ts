import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { BaseNavComponent } from '../../../base';
import { NavService } from '../../../base/nav.service';

@Component({
  selector: 'quote-breadcrumb',
  templateUrl: './quote-breadcrumb.component.html'
})
export class QuoteBreadcrumbComponent extends BaseNavComponent implements OnInit {
  // @Output() public notify: EventEmitter<string> = new EventEmitter<string>();
  @Input() public lobQuestionAnswers: any;
  @Input() private qNumber: string;
  @Input() private step: string;
  private routes: any[];

  constructor(private navService: NavService, protected router: Router) {
    super();
    this.safeSubscribe(this.navService.events).subscribe(() => {
      this.resetRoutes();
    });
  }

  public ngOnInit() {
    this.resetRoutes();
  }

  public checkIndex(routeIdx): boolean {
    // TODO: has summary been saved?
    if (this.isCompleted('summary') && this.step === 'businessInfo' && routeIdx === 1) {
      console.log('/broker/summary/' + this.qNumber);
      this.navigateTo(['/summary/'.concat(this.qNumber)]);
    // TODO: has bind been saved?
    } else if (this.isCompleted('bindInfo') && this.step === 'businessInfo' && routeIdx === 2) {
      console.log('/broker/bind/' + this.qNumber);
      this.navigateTo(['/bind/'.concat(this.qNumber)]);
    // Yes, businessInfo has been saved
    } else if (!this.isCompleted('businessInfo') && this.step === 'summary' && routeIdx === 0) {
      this.navigateTo(['/broker/businessInfo/'.concat(this.qNumber)]);
    // TODO: has bind been saved?
    } else if (this.isCompleted('bindInfo') && this.step === 'summary' && routeIdx === 2) {
      console.log('/broker/bind/' + this.qNumber);
      this.navigateTo(['/bind/'.concat(this.qNumber)]);
    // Yes, businessInfo has been saved
    } else if (this.isCompleted('businessInfo') && this.step === 'bindInfo' && routeIdx === 0) {
      this.navigateTo(['/broker/businessInfo/'.concat(this.qNumber)]);
    // Yes, summary has been saved
    } else if (this.isCompleted('summary') && this.step === 'bindInfo' && routeIdx === 1) {
      this.navigateTo(['/broker/summary/'.concat(this.qNumber)]);
    }
    return false;
  }

  private resetRoutes() {
    if (this.navService.isBroker()) {
      this.routes = Routes.brokerRoutes;
    } else {
      this.routes = Routes.underwriterRoutes;
    }
  }

  private isCompleted(route: any): boolean {
    if (this.step === 'coverageInfo') {
      return route.name === 'businessInfo';
    } else if (this.step === 'summary') {
      return route.name === 'businessInfo' || route.name === 'coverageInfo';
    } else if (this.step === 'bindInfo') {
      return route.name !== 'bindInfo';
    }
    return false;
  }

  private isCurrent(route: any): boolean {
    return route.name === this.step;
  }
}

class Routes {
  public static underwriterRoutes = [{
    id: 0,
    name: 'businessInfo'
  }, {
    id: 1,
    name: 'coverageInfo'
  }, {
    id: 2,
    name: 'summary'
  }, {
    id: 3,
    name: 'bindInfo'
  }];

  public static  brokerRoutes = [{
    id: 0,
    name: 'businessInfo'
  }, {
    id: 1,
    name: 'summary'
  }, {
    id: 2,
    name: 'bindInfo'
  }];
}
