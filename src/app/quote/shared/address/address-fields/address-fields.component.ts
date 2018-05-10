import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { AddressService } from '../../address';
import { Address } from '../../../models';
import { AddressSearchService } from '../../../businessInfo/address-search/address-search.service';

@Component({
  selector: 'address-fields',
  templateUrl: './address-fields.component.html',
  providers: [
    AddressSearchService
  ]
})
export class AddressFieldsComponent implements OnInit {
  private _showErrors: boolean;
  private _matchedAddress: any;
  private addressFields: FormGroup;
  private formCreated: boolean = false;
  private addressErrors: AddressErrors;

  @Input() private parentForm: FormGroup;
  @Input() private savedAddress?: Address;

  @Input() set showErrors(showErrors: boolean) {
    this._showErrors = showErrors;
  }
  get showErrors(): boolean {
    return this._showErrors;
  }

  @Input() set matchedAddress(matchedAddress: any) {
    if (matchedAddress) {
      this._matchedAddress = matchedAddress;
      if (!this.formCreated) {
        this.createForm();
      }
      this.setAddress(matchedAddress);
    }
  }
  get matchedAddress(): any {
    return this._matchedAddress;
  }

  constructor(
    private formBuilder: FormBuilder,
    private addressService: AddressService
  ) { }

  public ngOnInit() {
    if (this.savedAddress) {
      this.createForm();
    }
  }

  private createForm() {
    this.addressFields = this.formBuilder.group({
      unitNumber: new FormControl(),
      // Todo: Separate unitNumber from streetAddress if savedAddress exists
      // and unitNumber is included in streetAddress. Refer to CTLT-3494.
      streetAddress: new FormControl(
        this.savedAddress ? this.savedAddress.streetAddress : null,
        Validators.required
      ),
      city: new FormControl(
        this.savedAddress ? this.savedAddress.city : null,
        Validators.required
      ),
      province: new FormControl(
        this.savedAddress ? this.savedAddress.province : null,
        Validators.required
      ),
      postalCode: new FormControl(
        this.savedAddress ? this.savedAddress.postalCode : null,
        Validators.required
      )
    });
    this.parentForm.addControl('addressFields', this.addressFields);
    this.formCreated = true;

    this.onValueChanged(); // (re)set validation messages now
    this.addressFields.valueChanges
      .subscribe(data => this.onValueChanged(data));
  }

  private onValueChanged(data?: any) {
    this.addressErrors = new AddressErrors();
    Object.keys(this.addressErrors).forEach(field => {
      const control = this.addressFields.get(field);
      if (control && !control.valid) {
        for (const key in control.errors) {
          if (control.errors.hasOwnProperty(key)) {
            this.addressErrors[field].push(key);
          }
        }
      }
    });
  }

  /**
   * Process Pitney Bowes result and set result values to address controls
   * @param result Pitney Bowes result
   */
  private setAddress(result: any) {
    if (this.addressFields) {
      this.clearAddressFormGroupValues(this.addressFields);
      this.addressFields.get('city').setValue(result.City);
      this.addressFields.get('province').setValue(result.StateProvince);
      // this.addressFields.get('country').setValue(result.Country);
      this.addressFields.get('postalCode').setValue(result.PostalCode);
      let regex1 = new RegExp(/\d+[A-Za-z]*/, 'g');
      let unitNumber = '';
      if (result.ApartmentLabel2) {
        // If ApartmentLabel2 is not enpry, possible values are like '2218', 'Unit 2218' and 'Apt 2218'
        let matchArray = result.ApartmentLabel2.match(regex1);
        // The AddressLine1 of result contains both apartment number and street address, like '190 Lees Ave Unit 2218'
        if (matchArray) {
          // Unit number in Pitney Bowes result
          unitNumber = matchArray[0];
        }
      }
      let streetAddressControl = this.addressFields.get('streetAddress');
      if (unitNumber) {
        this.addressFields.get('unitNumber').setValue(unitNumber);
        let regex2 = new RegExp(result.ApartmentLabel2 + '-*');
        let streetAddress: string = result.AddressLine1;
        // Remove unit number and '-' from street address and set it to control value
        streetAddressControl.setValue(streetAddress.replace(regex2, '').trim());
      } else {
        streetAddressControl.setValue(result.AddressLine1);
      }
    }
  }

  private clearAddressFormGroupValues(formGroup: AbstractControl) {
    Object.keys(formGroup.value).forEach(field => {
      formGroup.get(field).reset();
    });
  }
}

class AddressErrors {
  public streetAddress: string[] = [];
  public city: string[] = [];
  public province: string[] = [];
  public postalCode: string[] = [];
}
