import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';

@Component({
  selector: 'modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
  @Input('title') protected title;
  @Input('closeTitle') protected closeTitle;
  @Input('size') protected size = 'lg';
  @Input('displayHeader') protected displayHeader = true;
  @Input('ignoreBackdropClick') protected ignoreBackdropClick = false;
  @ViewChild('modal') protected modal: ModalDirective;

  protected isSpinnerVisible: boolean = false;
  protected config: any = {};

  public ngOnInit() {
    if (this.ignoreBackdropClick) {
      this.config.backdrop = 'static';
    }
  }

  public show(): void {
    this.modal.show();
  }

  public hide(): void {
    this.modal.hide();
  }

  public toggleSpinner() {
    this.isSpinnerVisible = !this.isSpinnerVisible;
  }

  public setSpinner(value: boolean) {
    this.isSpinnerVisible = value;
  }
}
