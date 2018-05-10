import { Component, Input, OnInit } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ChartColors } from './chartColors';

@Component({
  selector: 'pie-chart',
  template: `
    <ngx-charts-pie-chart
      [scheme]="colorScheme"
      [results]="chartData"
      [explodeSlices]="explodeSlices"
      [labels]="showLabels"
      [doughnut]="showDoughnutType"
      [gradient]="gradient"
      [legend]="showLegend"
      (select)="onSelect($event)">
    </ngx-charts-pie-chart>
  `
})

export class PieChartComponent implements OnInit {
  @Input() private rawData: any[];
  @Input() private showDoughnutType: boolean; //  should doughnut instead of pie slices

  private chartData = [];

  private showLegend = false;
  private gradient = false;
  private showLabels = false;
  private explodeSlices = false;
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
