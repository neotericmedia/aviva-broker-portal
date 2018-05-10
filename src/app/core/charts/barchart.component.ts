import { Component, Input, OnInit } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ChartColors } from './chartColors';

@Component({
  selector: 'bar-chart',
  template: `
    <ngx-charts-bar-vertical
      [scheme]="colorScheme"
      [results]="chartData"
      [gradient]="gradient"
      [xAxis]="showXAxis"
      [yAxis]="showYAxis"
      [legend]="showLegend"
      [showXAxisLabel]="showXAxisLabel"
      [showYAxisLabel]="showYAxisLabel"
      [xAxisLabel]="xAxisLabel"
      [yAxisLabel]="yAxisLabel"
      (select)="onSelect($event)">
    </ngx-charts-bar-vertical>
  `
})
export class BarChartComponent implements OnInit {
  @Input() private rawData: any[];
  @Input() private xAxisLabel: string;
  @Input() private yAxisLabel: string;
  private chartData = [];

  private showXAxis = true;
  private showYAxis = true;
  private gradient = false;
  private showLegend = false;
  private showXAxisLabel = true;
  private showYAxisLabel = true;
  private colorScheme = {
    domain: ChartColors.getColorScheme()
  };

  public ngOnInit() {
    if (this.rawData && this.rawData.length) {
      this.rawData.forEach(item => {
        this.chartData.push({
          name: item.name,
          value: item.count
        });
      });
    }
  }

  private onSelect(event) {
    console.log(event);
  }
}
