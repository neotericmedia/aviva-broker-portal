import { Component, Input, OnDestroy, ViewChild } from '@angular/core';

@Component({
  selector: 'confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss']
})
export class ConfirmModalComponent implements OnDestroy {
  @Input('message') protected message;
  @Input('confirmTitle') protected confirmTitle;
  @Input('declineTitle') protected declineTitle;
  @Input('onOk') protected onOk: Function;
  @ViewChild('myModal') protected myModal;
  private guard: any;

  public ngOnDestroy() {
    this.dismissGuard(false);
  }

  public show(callback: (result) => void): Promise<boolean> {
    this.myModal.setSpinner(false);
    this.myModal.show();
    // todo: the discard button should be auto focused at this point.
    return new Promise((resolve, reject) => {
      this.guard = resolve;
    });
  }

  public hide(): void {
    this.myModal.setSpinner(false);
    this.myModal.hide();
  }

  private confirm() {
    this.hide();
    this.dismissGuard(true);
  }

  private decline() {
    this.hide();
    this.dismissGuard(false);
  }

  private dismissGuard(confirm: boolean) {
    if (this.guard) {
      this.guard(confirm);
      delete this.guard;
    }
  }
}
