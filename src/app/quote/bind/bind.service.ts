import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { WebServiceURLs } from '../../shared/webServiceURLs';
import { TranslateService } from 'ng2-translate';
import { ToastsManager, Toast } from 'ng2-toastr/ng2-toastr';
import { serialize, deserialize } from 'serializer.ts/Serializer';
import { BindTypeOption, BindForm, BindType, Quote } from '../models';

@Injectable()
export class BindService {
  public bindTypeArray: BindTypeOption[];
  // bindPartyLookup is to map bindPartyForms with saved bindParty objects
  public bindPartyLookup: Map<number, BindForm> = new Map();
  // Use formCounter as unique identifier for the lost payees and mortgagees
  // formCounter increases by 1 after a new form is added.
  private formCounter: number = 0;
  private cachedTypeId: string;

  constructor(
    private http: Http,
    private formBuilder: FormBuilder,
    private toastr: ToastsManager,
    private translate: TranslateService
  ) {
    this.http.get(WebServiceURLs.bindTypesControls).toPromise()
      .then(res => {
        this.bindTypeArray = deserialize<BindTypeOption[]>(BindTypeOption, res.json());
      }).catch(e => {
        this.toastr.error(this.translate.instant('bind.toast.getBindTypesError'));
      });
  }

  public addPayeeMortgagee(formArray: FormArray, bindParty?: BindForm) {
    if (this.isLastFormValid(formArray)) {
      const control = this.formBuilder.group({
        id: new FormControl(this.formCounter++),
        bindName: new FormControl(bindParty ? bindParty.name : null, Validators.required),
        bindType: new FormControl(bindParty ? bindParty.type : null, Validators.required)
      });
      formArray.push(control);
      if (bindParty) {
        this.bindPartyLookup.set(control.value.id, bindParty);
        if (this.isMortgageeOption(bindParty.type.toString())) {
          this.disableMortgageeOption(control.value.bindType);
        }
      }
    } else {
      this.toastr.error(this.translate.instant('bind.toast.lastFormInvalid'));
    }
  }

  public cacheTypeId(value) {
    if (value) {
      this.cachedTypeId = value;
    }
  }

  public updateMortgageeOption(event) {
    const value = event.target.value;
    event.target.blur();
    if (this.isMortgageeOption(value)) {
      const current = this.bindTypeArray.find(item => {
        return item.id === value;
      });
      // Disable this mortgagee option in other forms by marking selected.
      current.selected = true;
    }
    if (this.isMortgageeOption(this.cachedTypeId)) {
      const previous = this.bindTypeArray.find(item => {
        return item.id === this.cachedTypeId;
      });
      // Enable this mortgagee option in other forms.
      previous.selected = false;
    }
  }

  public enableMortgageeOption(typeId: string) {
    const found = this.bindTypeArray.find(item => {
      return item.id === typeId;
    });
    found.selected = false;
  }

  public disableMortgageeOption(typeId: string) {
    const found = this.bindTypeArray.find(item => {
      return item.id === typeId;
    });
    found.selected = true;
  }

  public isMortgageeOption(value: string): boolean {
    const num = parseInt(value, 10);
    return num === BindType.FIRST_MORTGAGEE ||
      num === BindType.SECOND_MORTGAGEE ||
      num === BindType.THIRD_MORTGAGEE;
  }

  public isPayeeOption(value: string): boolean {
    const num = parseInt(value, 10);
    return num === BindType.LOSS_PAYEE;
  }

  public lookupBindTypeTitle(typeId: string): string {
    const found = this.bindTypeArray.find(type => {
      return type.id === typeId;
    });
    return found.Value;
  }

  public getQuote(quoteNumber: string) {
    const url = WebServiceURLs.getFindByQuoteNumberUrl(quoteNumber);
    return this.http.get(url).toPromise()
      .then(res => {
        return deserialize<Quote>(Quote, res.json());
      });
  }

  public save(
    lossPayeeArray: BindForm[],
    mortgageeArray: BindForm[],
    quoteNumber: string,
    effectiveDate: Date,
    expiryDate: Date) {
    const url = WebServiceURLs.getSaveBindInfoUrl(quoteNumber);

    const payload = {
      mortgagee: mortgageeArray,
      lossPayee: lossPayeeArray,
      effectiveDate: effectiveDate,
      expiryDate: expiryDate
    };

    return this.http.post(url, serialize(payload))
      .toPromise()
      .then(response => {
        return {
          status: 'ok'
        };
      }).catch(e => {
        const error = e.json();
        return {
          status: 'fail',
          error: error
        };
      });
  }

  public unbind(quoteNumber: string) {
    return this.http.post(WebServiceURLs.getUnbindInfoUrl(quoteNumber), {})
      .toPromise()
      .then(response => {
        return {
          status: 'ok'
        };
      }).catch(e => {
        const error = e.json();
        return {
          status: 'fail',
          error: error
        };
      });
  }

  private isLastFormValid(formArray: FormArray): boolean {
    const arrayLength = formArray.length;
    if (arrayLength) {
      return formArray.at(arrayLength - 1).valid;
    } else {
      return true;
    }
  }
}
