import { OnInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { BaseFormComponent } from '../base';
import { ReportService } from '../report';
import { TranslateService } from 'ng2-translate';
import { Option } from '../quote/models';

@Component({
  selector: 'report',
  templateUrl: './report.component.html',
  providers: [ReportService]
})
export class ReportComponent extends BaseFormComponent implements OnInit {
  private reportForm: FormGroup;
  private maxToDate: Date = new Date();
  private maxFromDate: Date = new Date();
  private quoteTypes: Option[] = [];

  constructor(
    protected router: Router,
    protected toastr: ToastsManager,
    protected translate: TranslateService,
    private formBuilder: FormBuilder,
    private reportService: ReportService
  ) {
    super(translate, router);
  }

  public async ngOnInit() {
    const curDate = new Date();
    this.reportForm = this.formBuilder.group({
      quoteNumber: new FormControl(),
      fromDate: new FormControl(this.moment(curDate).subtract(1, 'day').toDate()),
      toDate: new FormControl(new Date()),
      reportType: new FormControl()
    });

    this.maxFromDate = curDate;
    this.quoteTypes = await this.reportService.getReportTypes();
  }

  private onUpdateFromDate(selectedDate) {
    this.reportForm.controls.fromDate.setValue(selectedDate);
    const tomorrow = this.moment(selectedDate).add(1, 'day').toDate();
    this.reportForm.controls.toDate.setValue(tomorrow);
  }

  private onUpdateToDate(selectedDate) {
    this.reportForm.controls.toDate.setValue(selectedDate);
    const from = this.reportForm.controls.fromDate;
    if (from.value > selectedDate) {
      from.setValue(this.moment(selectedDate).subtract(1, 'day').toDate());
    }
  }

  private getTimeline() {
    const quoteNumber = this.reportForm.controls.quoteNumber.value;
    if (quoteNumber) {
      this.reportService.getTimelineInCSV(quoteNumber.trim()).then(data => {
        this.triggerDownload(data);
      }).catch((e: Error) => {
        this.toastr.error(this.translate.instant('quoteReport.error.noReport'));
      });
    } else {
      this.toastr.error(this.translate.instant('quoteReport.error.quoteNumber'));
    }
  }

  private getReport() {
    const controls = this.reportForm.controls;
    const from = controls.fromDate.value;
    const to = controls.toDate.value;
    const type = controls.reportType.value;
    if (from && to && type) {
      const fromDate = this.moment(from).format('YYYY-MM-DD');
      const toDate = this.moment(to).format('YYYY-MM-DD');
      this.reportService.getReport(fromDate, toDate, type).then(data => {
        this.triggerDownload(data);
      }).catch((e: Error) => {
        this.toastr.error(this.translate.instant('quoteReport.error.noReport'));
      });
    } else {
      this.toastr.error(this.translate.instant('quoteReport.error.fields'));
    }
  }

  private triggerDownload(data: any) {
    const fileData = new Blob([data.content], { type: 'text/csv' });
    const fileName = data.fileName;
    // for IE10+
    if (navigator.msSaveBlob) {
      return navigator.msSaveBlob(data.content, fileName);
    } else {
      // for Chrome, Firefox
      const objectUrl = window.URL.createObjectURL(fileData);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.setAttribute('type', 'hidden');
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  }

}
