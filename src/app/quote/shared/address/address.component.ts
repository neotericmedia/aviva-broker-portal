import { OnInit, Component, Input } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { AddressSearchService } from './address-search';
import { Address } from '../../models';

@Component({
  selector: 'address',
  templateUrl: './address.component.html',
  providers: [
    AddressSearchService
  ]
})
export class AddressComponent  implements OnInit {
  private addressForm: FormGroup;
  private addressInfoText: string;
  private addressInfoDS: Observable<any>;
  private addressInfoLoading: boolean;
  private addressInfoNoMatch: boolean;
  private ifShowAutoCompleter: boolean = false;
  private matchedAddress: any;
  private _showErrors: boolean;
  @Input() private parentForm: FormGroup;
  @Input() private savedAddress?: Address;
  @Input() set showErrors(showErrors: boolean) {
    this._showErrors = showErrors;
  }
  get showErrors(): boolean {
    return this._showErrors;
  }

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastsManager,
    private addressSearchService: AddressSearchService
  ) {
    this.addressInfoDS = Observable
    .create((observer: any) => {
      observer.next(this.addressInfoText);
    })
    .mergeMap((token: string) => this.addressSearchService.search(token));
  }

  public ngOnInit() {
    this.addressForm = this.formBuilder.group({});
    if (!this.savedAddress) {
      // Define formControl for address autoCompleter only if there is no saved address. If there
      // is saved address, dispaly address in individual fields to save a Pitney Bowes address search.
      this.showAutoCompleter();
    }
    this.parentForm.addControl('address', this.addressForm);
  }

  private setAddressLoading(isLoading: boolean) {
    this.addressInfoLoading = isLoading;
    this.addressInfoNoMatch = false;
  }

  private setAddressNoMatch(isNoMatch: boolean) {
    this.addressInfoNoMatch = isNoMatch;
    this.addressInfoLoading = false;
  }

  private onBlurAddress() {
    if (this.addressInfoNoMatch || this.addressInfoLoading) {
      this.addressForm.controls.addressAutoCompleter.reset();
    }
  }

  private updateAddress(event) {
    // Currently only Canadian address is accepted.
    if (event.item.Country && event.item.Country !== 'Canada') {
      this.toastr.error('generic.address.error.country.notCanada');
      this.addressForm.get('addressAutoCompleter').reset();
    } else {
      this.matchedAddress = event.item;
    }
  }

  private changeAddressDetails() {
    this.addressForm.removeControl('addressAutoCompleter');
    this.addressInfoText = null;
    this.ifShowAutoCompleter = false;
  }

  private showAutoCompleter() {
    const control = new FormControl(null, Validators.required);
    this.addressForm.addControl('addressAutoCompleter', control);
    this.ifShowAutoCompleter = true;
  }
}
