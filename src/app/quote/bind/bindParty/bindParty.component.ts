import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { TranslateService } from 'ng2-translate';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { BindService } from '../bind.service';
import { Address } from '../../models';
import { AddressSearchService } from '../../businessInfo/address-search/address-search.service';

@Component({
  selector: 'bindParty',
  styleUrls: ['./bindParty.component.scss'],
  templateUrl: './bindParty.component.html',
  providers: [
    AddressSearchService
  ]
})
export class BindPartyComponent implements OnInit {
  private _showErrors: boolean;
  private showAddDropdown: boolean = false;
  private savedAddress: Address;
  @Output() private formIdEmitter: EventEmitter<number> = new EventEmitter();
  @Input() private parentForm: FormArray;
  @Input() private bindParty: FormGroup;
  @Input() set showErrors(showErrors: boolean) {
    this._showErrors = showErrors;
  }
  get showErrors(): boolean {
    return this._showErrors;
  }

  constructor(
    protected translate: TranslateService,
    private toastr: ToastsManager,
    private bindService: BindService
  ) {}

  public ngOnInit() {
    const savedBindParty = this.bindService.bindPartyLookup.get(this.bindParty.value.id);
    // if is in edit mode, store address in savedAddress which is to be passed down
    // to the child AddressComponent and AddressFieldsComponent
    if (savedBindParty) {
      this.savedAddress = savedBindParty.address;
    }
  }

  private getTitle() {
    const hasBindNameValue = !!this.bindParty.value.bindName;
    const hasBindTypeValue = !!this.bindParty.value.bindType;
    const hasBindTypeControl = !!this.bindParty.controls.bindType;
    let title: string;

    if (hasBindTypeControl) {
      if (hasBindTypeValue) {
        const bindType = this.bindParty.value.bindType;
        if (hasBindNameValue) {
          const bindName = this.bindParty.value.bindName;
          if (this.bindService.isMortgageeOption(bindType)) {
            title = this.translate.instant('bind.mortgageePrefix', { name: bindName });
          } else if (this.bindService.isPayeeOption(bindType)) {
            title = this.translate.instant('bind.lossPayeePrefix', { name: bindName });
          }
        } else {
          title = this.translate.instant('bind.addPayeeMortgagee');
        }
      } else {
        title = this.translate.instant('bind.addPayeeMortgagee');
      }
    }

    return title;
  }

  private toggleAddDropdown() {
    this.showAddDropdown = !this.showAddDropdown;
  }

  private addAnother() {
    if (this.bindParty.valid) {
      const bindType = this.bindParty.value.bindType;
      this.bindService.addPayeeMortgagee(this.parentForm);
    } else {
      this.showErrors = true;
      this.toastr.error(this.translate.instant('bind.toast.lastFormInvalid'));
    }
    this.showAddDropdown = false;
  }

  private closeDropdown() {
    if (this.bindParty.invalid) {
      this.showErrors = true;
      this.toastr.error(this.translate.instant('bind.toast.completeBeforeClose'));
    }
    this.showAddDropdown = false;
  }

  private deleteControl(event) {
    event.stopPropagation();
    this.formIdEmitter.emit(this.bindParty.value.id);
  }

  // Check if these formControl is the last element of the formArray
  private isLastControl(): boolean {
    return this.bindParty.value.id === this.parentForm.at(this.parentForm.length - 1).value.id;
  }
}
