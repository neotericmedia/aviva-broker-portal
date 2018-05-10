import { Component, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'payee-mortgagee-modal',
  templateUrl: './payee-mortgagee-modal.component.html',
  styleUrls: ['./payee-mortgagee-modal.component.scss']
})
export class PayeeMortgageeModalComponent implements OnInit {
  @ViewChild('payeeMortgageeModal') protected payeeMortgageeModal;

  private payeeSelected: boolean = true;
  private payeeMortgageeForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder
  ) { }

  public ngOnInit() {
    this.payeeMortgageeForm = this.formBuilder.group({
    });
  }

  public show(): void {
    this.payeeMortgageeModal.setSpinner(false);
    this.payeeMortgageeModal.show();
  }

  public hide(): void {
    this.payeeMortgageeModal.setSpinner(false);
    this.payeeMortgageeModal.hide();
  }

  private onSelectPayee(flag: boolean) {
    this.payeeSelected = flag;
  }
}
