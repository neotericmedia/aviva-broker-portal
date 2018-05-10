import { FormGroup, FormBuilder, FormControl, AbstractControl, Validators, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from 'ng2-translate';

import { BaseFormComponent } from '../../base';
import { BusinessInfo, Claim, OfferingAndLobCodes } from '../models';
import { EmailValidator } from '../../shared/validation/emailValidator';

export class BusinessInfoFormComponent extends BaseFormComponent {
  protected businessInfoForm: FormGroup;
  protected businessInfo: BusinessInfo;
  protected claims: Claim[] = [];
  protected offeringAndLobCodes: OfferingAndLobCodes = new OfferingAndLobCodes();
  protected formErrors = new FormErrors();
  protected revenueFields: string[] = [
    'annualRevenueCA',
    'annualRevenueUS',
    'annualRevenueFO'
  ];
  protected payrollFields: string[] = [
    'annualPayrollCA'
    /*, 'annualPayrollUS', 'annualPayrollFO' */
  ];
  protected activeIncomeValidators: ValidatorFn[] = [Validators.required];

  constructor(
    protected translate: TranslateService,
    protected router: Router,
    protected formBuilder: FormBuilder
  ) {
    super(translate, router);
  }

  protected buildForm(): void {
    this.businessInfoForm = this.formBuilder.group({
      brokerCode: [this.businessInfo.brokerCode, [Validators.required]],
      brokerContactName: [this.businessInfo.brokerContactName, [Validators.required]],
      brokerContactEmail: [this.businessInfo.brokerContactEmail, [EmailValidator]],
      namedInsured: [this.businessInfo.namedInsured, [Validators.required]],
      businessSetup: [this.businessInfo.businessSetup, [Validators.required]],
      annualRevenueCA: [this.businessInfo.annualRevenueCA, this.activeIncomeValidators],
      annualRevenueUS: [this.businessInfo.annualRevenueUS, this.activeIncomeValidators],
      annualRevenueFO: [this.businessInfo.annualRevenueFO, this.activeIncomeValidators],
      annualPayrollCA: [this.businessInfo.annualPayrollCA],
      yearsInBusiness: [this.businessInfo.businessDetails.yearsInBusiness, [Validators.required]],
      yearsInRelevantBusiness: [this.businessInfo.yearsInRelevantBusiness, [Validators.required]],
      wasPolicyCancelled: [this.businessInfo.wasPolicyCancelled, [Validators.required]],
      numOfClaims: [this.businessInfo.numOfClaims, [Validators.required]],
      overClaimLimit: [this.businessInfo.overClaimLimit, [Validators.required]],
      locationAddressAutoCompleter: ['', [Validators.required]],
      offeringAndLobCodes: [this.offeringAndLobCodes, [Validators.required]]
    });

    this.addAddressFormGroup('companyAddress');
    this.addAutoCompleterControl('locationAddressAutoCompleter');

    this.onValueChanged(); // (re)set validation messages now
    this.safeSubscribe(this.businessInfoForm.valueChanges)
      .subscribe(data => this.onValueChanged(data));
  }

  protected isFormDirty(): boolean {
    return this.businessInfoForm && !this.businessInfoForm.pristine;
  }

  /**
   * Show either Payroll or Revenue fields in the form. Decided by RatingBasis value.
   *
   * @param ratingBasis String 'PY' or 'RV' indicating Payroll or Revenue as the method
   * used for rating in Ratabase.
   */
  protected togglePayrollRevenue(ratingBasis: string) {
    const bizControls = this.businessInfoForm.controls;
    if ('PY' === ratingBasis) {
      // Disable revenue set
      bizControls.annualRevenueCA.clearValidators();
      bizControls.annualRevenueUS.clearValidators();
      bizControls.annualRevenueFO.clearValidators();

      // Recall payroll set
      bizControls.annualPayrollCA.setValidators(this.activeIncomeValidators);
    } else {
      // Disable payroll set
      bizControls.annualPayrollCA.clearValidators();

      // Recall revenue set
      bizControls.annualRevenueCA.setValidators(this.activeIncomeValidators);
      bizControls.annualRevenueUS.setValidators(this.activeIncomeValidators);
      bizControls.annualRevenueFO.setValidators(this.activeIncomeValidators);
    }
    bizControls.annualRevenueCA.updateValueAndValidity();
    bizControls.annualRevenueUS.updateValueAndValidity();
    bizControls.annualRevenueFO.updateValueAndValidity();
    bizControls.annualPayrollCA.updateValueAndValidity();
  }

  protected addExtraBusinessNameControls() {
    const relationToInsuredControl = new FormControl(this.businessInfo.relationToInsured, Validators.required);
    const operatingNameControl = new FormControl(this.businessInfo.operatingName, Validators.required);
    this.businessInfoForm.addControl('relationToInsured', relationToInsuredControl);
    this.businessInfoForm.addControl('operatingName', operatingNameControl);
  }

  protected removeExtraBusinessNameControls() {
    this.businessInfoForm.removeControl('relationToInsured');
    this.businessInfoForm.removeControl('operatingName');
  }

  protected addAddressFormGroup(formGroupName: string) {
    const groupName = this.businessInfo[formGroupName];
    let addressGroup = this.formBuilder.group({
      unitNumber: [groupName.unitNumber],
      streetAddress: [groupName.streetAddress, [Validators.required]],
      city: [groupName.city, [Validators.required]],
      province: [groupName.province, [Validators.required]],
      country: [groupName.country],
      postalCode: [groupName.postalCode, [Validators.required]]
    });
    this.businessInfoForm.addControl(formGroupName, addressGroup);
  }

  protected removeMailingAddressFormGroup() {
    this.businessInfoForm.removeControl('mailingAddress');
  }

  protected addAutoCompleterControl(formControlName: string) {
    let addressControl = new FormControl('', Validators.required);
    this.businessInfoForm.addControl(formControlName, addressControl);
  }

  protected removeAutoCompleterControl(formControlName: string) {
    this.businessInfoForm.removeControl(formControlName);
  }

  protected clearAddressFormGroupValues(formGroup: AbstractControl) {
    Object.keys(formGroup.value).forEach(field => {
      formGroup.get(field).reset();
    });
  }

  protected addClaims(numOfClaims: number) {
    this.claims = [];
    this.formErrors['claims'] = [];
    for (let i = 0; i < numOfClaims; i++) {
      this.claims.push(new Claim());
      this.formErrors['claims'].push(new ClaimError());
    }

    this.initClaimsForm(this.claims);
  }

  protected copyClaims(claims: Claim[]) {
    this.formErrors['claims'] = [];
    this.claims = claims.map(claim => {
      this.formErrors['claims'].push(new ClaimError());
      return new Claim(claim);
    });

    this.initClaimsForm(claims);
  }

  protected removeClaims() {
    this.claims = new Array<Claim>();
    if (this.formErrors.hasOwnProperty('claims')) {
      this.formErrors['claims'] = undefined;
    }
    this.businessInfoForm.removeControl('claims');
  }

  private initClaimsForm(claims: Claim[]) {
    let claimsListFormGroup = this.formBuilder.group({});
    claims.forEach((claim, index) => {
      let lob = claim.lineOfBusiness;
      let hasLob = !!lob;
      let claimFormGroup = this.formBuilder.group({
        lineOfBusiness: new FormControl(claim.lineOfBusinessId, Validators.required),
        status: new FormControl(claim.statusId, Validators.required),
        lossDate: new FormControl(claim.lossDate, Validators.required),
        lossType: new FormControl({ value: claim.lossTypeId, disabled: !hasLob }, Validators.required)
      });
      claimsListFormGroup.addControl('claim-' + index, claimFormGroup);
    });
    this.businessInfoForm.addControl('claims', claimsListFormGroup);
  }

  private onValueChanged(data?: any) {
    if (!this.businessInfoForm) { return; }
    const form = this.businessInfoForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        let errors = this.formErrors[field];
        // for previous claims
        if (errors && errors.length && (errors[0] instanceof ClaimError)) {
          for (let i = 0; i < errors.length; i++) {
            // Clear previous error message, if any
            errors[i] = new ClaimError();
          }
          let claimsListControl = form.get(field) as FormGroup;
          Object.keys(claimsListControl.controls).forEach((keyClaim, index) => {
            let claimControl = claimsListControl.get(keyClaim) as FormGroup;
            Object.keys(claimControl.controls).forEach((fieldClaim) => {
              let fieldInvalid = claimControl.get(fieldClaim).invalid;
              let fieldErrors = claimControl.get(fieldClaim).errors;
              if (fieldInvalid) {
                Object.keys(fieldErrors).forEach((key) => {
                  this.formErrors[field][index][fieldClaim].push(key);
                });
              }
            });
          });
        } else {  // for other fields
          if (field === 'quoteSuggestion') {
            delete this.formErrors[field];
          } else {
            this.formErrors[field] = [];
          }
          const control = form.get(field);
          // if (control && control.dirty && !control.valid) {
          if (control && !control.valid) {
            for (const key in control.errors) {
              if (control.errors.hasOwnProperty(key)) {
                this.formErrors[field].push(key);
              }
            }
          }
        }
      }
    }
  }
}

class FormErrors {
  public brokerCode: string[] = [];
  public brokerContactName: string[] = [];
  public brokerContactEmail: string[] = [];
  public quoteSuggestion: string = '';
  public namedInsured: string[] = [];
  public relationToInsured: string[] = [];
  public operatingName: string[] = [];
  public businessSetup: string[] = [];
  public yearsInBusiness: string[] = [];
  public yearsInRelevantBusiness: string[] = [];
  public numOfClaims: string[] = [];
  public overClaimLimit: string[] = [];
  public wasPolicyCancelled: string[] = [];
  public annualRevenueCA: string[] = [];
  public annualRevenueUS: string[] = [];
  public annualRevenueFO: string[] = [];
  public annualPayrollCA: string[] = [];
  public claims: ClaimError[];  // only intialize this if there are claims.
}

class ClaimError {
  public lineOfBusiness: string[] = [];
  public status: string[] = [];
  public lossDate: string[] = [];
  public lossType: string[] = [];
}
