import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/switchMap';
import { TranslateService } from 'ng2-translate';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { DashboardService } from './dashboard.service';

@Component({
  selector: 'dashboard',
  styleUrls: ['./dashboard.component.scss'],
  templateUrl: './dashboard.component.html',
  providers: [DashboardService]
})
export class DashboardComponent implements OnInit {
  private industryCode: any[];
  private brokerCode: any[];
  private quoteStatus: any[];
  private latestQuotes: any[];
  private ifShowSpinner: boolean = false;

  constructor(
    private dashboardService: DashboardService,
    private translate: TranslateService,
    public toastr: ToastsManager
  ) {}

  public ngOnInit() {
    this.getData();
  }

  private async getData() {
    this.toggleSpinner();
    let analytics: any;
    try {
      analytics = await this.dashboardService.getAnalytics();
      this.processAnalyticsData(analytics);
    } catch (e) {
      this.toastr.error(this.translate.instant('dashboard.notifications.noAnalytics'));
    }

    try {
      this.latestQuotes = await this.dashboardService.getLatestQuotes();
    } catch (e) {
      this.toastr.error(this.translate.instant('dashboard.notifications.noLatestQuotes'));
    }
    this.toggleSpinner();
  }

  /** Function to process Analytics Data. */
  private processAnalyticsData(data) {
    const industryCode: any[] = data.IndustryCode;
    if (industryCode && industryCode.length !== 0) {
      this.industryCode = [];
      this.transformAnalyticsToChartData(industryCode, this.industryCode, true);
    }
    const brokerCode: any[] = data.BrokerCode;
    if (brokerCode && brokerCode.length !== 0) {
      this.brokerCode = [];
      this.transformAnalyticsToChartData(brokerCode, this.brokerCode, false);
    }
    const quoteStatus: any[] = data.QuoteStatus;
    if (quoteStatus && quoteStatus.length !== 0) {
      this.quoteStatus = [];
      this.transformAnalyticsToChartData(quoteStatus, this.quoteStatus, true);
    }
  }

  /** Function to transform Analytics Data to Chart Data. */
  private transformAnalyticsToChartData(rawData: any[], chartData: any[], localeSupport: boolean) {
    if (rawData.length > 5) {
      // show no more than 5 records
      rawData = rawData.splice(0, 5);
    }
    const count = Object.keys(rawData).reduce((acc, cur) => acc + rawData[cur].count, 0);
    const dividend = count / 100;

    Object.keys(rawData).forEach(key => {
      if (dividend) {
        const ratio = Math.round(rawData[key].count / dividend);
        if (localeSupport) {
          chartData.push({
            name: rawData[key].Locale.Description,
            count: rawData[key].count,
            ratio: ratio + '%'
          });
        } else {
          chartData.push({
            name: rawData[key].Name,
            count: rawData[key].count,
            ratio: ratio + '%'
          });
        }
      }
    });
  }

  private toggleSpinner() {
    this.ifShowSpinner = !this.ifShowSpinner;
  }
}
