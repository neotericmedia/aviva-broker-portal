import { NgModule } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ModalModule } from 'ngx-bootstrap';

import { ModalComponent } from './modal';
import { SpinnerComponent } from './spinner';
import { TimelineComponent } from './timeline';
import { PieChartComponent, BarChartComponent } from './charts';

@NgModule({
  declarations: [
    ModalComponent,
    SpinnerComponent,
    PieChartComponent,
    BarChartComponent,
    TimelineComponent
  ],
  imports: [
    ModalModule,
    NgxChartsModule
  ],
  exports: [
    ModalComponent,
    SpinnerComponent,
    PieChartComponent,
    BarChartComponent,
    TimelineComponent
  ]
})
export class CoreModule {}
