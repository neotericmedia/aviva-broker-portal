import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BaseComponent } from '../../../base';

@Component({
  selector: 'address-details',
  styleUrls: ['./address-details.component.scss'],
  templateUrl: './address-details.component.html'
})
export class AddressDetailsComponent extends BaseComponent implements OnInit {
  private _form: FormGroup;
  private _showErrors: boolean;
  private _provinceOptions: string[];
  private addressFields: AddressFields;
  private addressErrors: AddressErrors;
  @Output() private fieldChanged = new EventEmitter();
  @Input() private isLocationDetails;

  @Input() set form(form: FormGroup) {
    this._form = form;
  }
  get form(): FormGroup {
    return this._form;
  }

  @Input() set showErrors(showErrors: boolean) {
    this._showErrors = showErrors;
  }
  get showErrors(): boolean {
    return this._showErrors;
  }

  @Input() set provinceOptions(provinceOptions: string[]) {
    this._provinceOptions = provinceOptions;
  }
  get provinceOptions(): string[] {
    return this._provinceOptions;
  }

  constructor() {
    super();
  }

  public ngOnInit() {
    if (this.isLocationDetails) {
      //  if it is the company address details form, initialize addressFields
      this.addressFields = new AddressFields();
      this.addressFields.streetAddress = this._form.get('streetAddress').value;
      this.addressFields.city = this._form.get('city').value;
      this.addressFields.province = this._form.get('province').value;
      this.addressFields.postalCode = this._form.get('postalCode').value;
    }

    this.safeSubscribe(this.form.valueChanges)
      .subscribe(data => this.onValueChanged(data));
    this.onValueChanged(); // (re)set validation messages now
  }

  private onValueChanged(data?: any) {
    this.addressErrors = new AddressErrors();
    Object.keys(this.addressErrors).forEach(field => {
      const control = this.form.get(field);
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
   * Emit event and update field in addressFields only if the field value is changed
   * @param fieldName The field whose value changes
   */
  private onBlur(fieldName: string) {
    if (this.isLocationDetails) {
      let currentFieldValue = this._form.get(fieldName).value.trim();
      if (currentFieldValue !== this.addressFields[fieldName]) {
        this.addressFields[fieldName] = currentFieldValue;
        this.fieldChanged.emit();
      }
    }
  }
}

class AddressErrors {
  public streetAddress: string[] = [];
  public city: string[] = [];
  public province: string[] = [];
  public postalCode: string[] = [];
}

/**
 * Store the old values of the mandatory individual fields
 */
class AddressFields {
  public streetAddress: string;
  public city: string;
  public province: string;
  public postalCode: string;
}
