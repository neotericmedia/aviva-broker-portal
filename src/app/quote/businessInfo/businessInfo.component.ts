import * as moment from 'moment';
import { Observable, Subject } from 'rxjs';
import { FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { Component, OnInit, AfterViewInit, HostListener, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateService } from 'ng2-translate';
import { ToastsManager, Toast } from 'ng2-toastr/ng2-toastr';
import { DeactivateGuardInterface } from '../../routing/authentication/deactivate-guard.interface';
import { BusinessInfoFormComponent } from './businessinfo.form.component';
import { AddressSearchService } from './address-search/address-search.service';
import { AddressInfo } from './address-search/address-search.model';
import { BrokerSearchService } from './broker-search/broker-search.service';
import { BusinessInfoService } from './businessInfo.service';
import { HeaderService } from '../../header/header.service';
import { QuoteSearchService } from './../search/quote-search.service';
import { NavService } from '../../base/nav.service';
import {
  BusinessInfo,
  Claim,
  ClaimQuestionsOptions,
  Address,
  DnBResponse,
  GDM,
  OfferingLobs,
  LOB,
  LegalName,
  Quote,
  OfferingAndLobCodes
} from '../models';
import { BusinessDateQuote } from './date-quote/business-date-quote.model';
import { IndustryRating } from './industry-rating/industry-rating.model';

const MIN_YEARS_IN_BUSINESS = 3;
const MIN_NUM_CLAIMS = 0;
const MAX_NUM_CLAIMS = 3;

@Component({
  selector: 'businessInfo',
  styleUrls: ['./businessInfo.component.scss'],
  templateUrl: './businessInfo.component.html',
  providers: [
    AddressSearchService,
    BrokerSearchService,
    BusinessInfoService,
    QuoteSearchService
  ]
})
export class BusinessInfoComponent extends BusinessInfoFormComponent
  implements OnInit, AfterViewInit, DeactivateGuardInterface {
  protected quoteNumber: string;
  protected showLobQuestions: boolean = false;
  protected showBusinessInfo: boolean = true;
  protected showIndustryRating: boolean = true;
  protected lobQuestionAnswers: any;

  @ViewChild('guardModal') private guardModal;

  private guardModalQuestion: string;
  private claimLossTypes = ['property', 'casualty'];
  private notifier: Subject<string> = new Subject();
  private dateQuoteInfo: BusinessDateQuote = new BusinessDateQuote();
  private industryRatingInfo: IndustryRating = new IndustryRating();
  private dnbResponse: DnBResponse[];
  private businessSetup = this.businessInfoService.getBusinessSetUp();
  private relationOptions = this.businessInfoService.getRelationOptions();
  private claimOptions = this.businessInfoService.getClaimOptions();

  private showOperatingName: boolean = false;
  private showCompanyAddressAutoCompleter: boolean = true;
  private showMailingAddressAutoCompleter: boolean = true;
  private showYearsInRelevantBusiness: boolean;
  private showControlsErrorsIfAny: boolean = false;
  private ifShowSpinner: boolean = false;

  private businessNameCache: string = ''; // hold the business name being used to make D&B service call
  private initPromise: Promise<Quote>;
  private brokerInfoDS: Observable<any>;
  private brokerInfoText: string;
  private brokerInfoLoading: boolean;
  private brokerInfoNoMatch: boolean;
  private addressInfoDS: Observable<any>;
  private addressInfoText: string;
  private addressInfoLoading: boolean;
  private addressInfoNoMatch: boolean;
  private mailingInfoDS: Observable<any>;
  private mailingInfoText: string;
  private mailingInfoLoading: boolean;
  private mailingInfoNoMatch: boolean;
  private mandatoryLobsTitle: string;
  private overClaimLimit: boolean;
  private claimQuestionsOptions: ClaimQuestionsOptions;
  private maxClaimDate: Date = new Date();
  private provinceOptions: string[];
  private isReady: boolean;
  private copied: boolean;

  constructor(
    protected router: Router,
    protected toastr: ToastsManager,
    protected translate: TranslateService,
    protected urlLocation: Location,
    protected formBuilder: FormBuilder,
    protected addressSearchService: AddressSearchService,
    protected brokerSearchService: BrokerSearchService,
    protected businessInfoService: BusinessInfoService,
    protected headerService: HeaderService,
    protected navService: NavService
  ) {
    super(translate, router, formBuilder);

    this.brokerInfoDS = Observable
      .create((observer: any) => {
        // Runs on every search
        observer.next(this.brokerInfoText);
      })
      .mergeMap((token: string) => this.brokerSearchService.search(token));

    this.addressInfoDS = Observable
      .create((observer: any) => {
        // Runs on every search
        observer.next(this.addressInfoText);
      })
      .mergeMap((token: string) => this.addressSearchService.search(token));

    this.mailingInfoDS = Observable
      .create((observer: any) => {
        // Runs on every search
        observer.next(this.mailingInfoText);
      })
      .mergeMap((token: string) => this.addressSearchService.search(token));
  }

  public showCopied() {
    this.copied = true;
    setTimeout(() => {
      this.copied = false;
    }, 11000);
  }

  public ngOnInit() {
    this.isReady = false;
    this.togglePayrollRevenue = this.togglePayrollRevenue.bind(this);
    this.initPromise = new Promise((resolve, reject) => {
      const isCopying = this.businessInfoService.isCopyingQuote().then((isCopy) => {
        if (isCopy) {
          this.showCopied();
        }
      });
      const quotePromise = this.businessInfoService.getQuote();
      quotePromise.then((quote: Quote) => {
        if (quote) {
          const businessInfo = quote.getBusinessInfo;
          this.lobQuestionAnswers = businessInfo.lobQuestionAnswers;
          // console.log(businessInfo);
          this.quoteNumber = businessInfo.quoteNumber;
          this.businessInfo = new BusinessInfo(businessInfo);
        } else {
          this.businessInfo = new BusinessInfo();
        }

        // Prepare Offering Code
        if (quote) {
          this.businessInfo.offeringCode = quote.getOfferingCode;
          this.offeringAndLobCodes.offeringCode = quote.getOfferingCode;

          // Prepare LOB selection
          this.businessInfo.lobCodes = quote.getLob.map(lob => {
            return lob.LOBCode;
          });
          this.offeringAndLobCodes.lobCodes = this.businessInfo.lobCodes.map(lob => {
            return lob;
          });
        }
        if (this.businessInfo.yearsInRelevantBusiness) {
          this.showYearsInRelevantBusiness = true;
        } else {
          this.businessInfo.yearsInRelevantBusiness = 0;
        }
        if (this.businessInfo.numOfClaims !== null) {
          this.selectNumOfClaims(this.businessInfo.numOfClaims);
        }
        if (this.businessInfo.numOfClaims > MIN_NUM_CLAIMS && this.businessInfo.numOfClaims < MAX_NUM_CLAIMS) {
          this.overClaimLimit = true;
        }
        if (this.businessInfo.industryCode) {
          this.industryRatingInfo.industryCode = this.businessInfo.industryCode;
          this.industryRatingInfo.industryCodeDescription = this.businessInfo.industryCodeDescription;
          this.industryRatingInfo.ratingBasis = this.businessInfo.ratingBasis;
        }

        this.buildForm();
        // If recalling existing quote, init with that rating basis.
        // Otherwise, start with RV until user toggles.
        this.togglePayrollRevenue(this.industryRatingInfo.ratingBasis || 'RV');

        if (this.businessInfo.businessSetup) {
          this.selectBusinessSetup(this.businessInfo.businessSetup);
        }
        if (this.businessInfo.operatingName && this.businessInfo.relationToInsured) {
          this.showOperatingName = true;
          this.addExtraBusinessNameControls();
        }
        this.isReady = true;
        resolve(quote);
      }).catch(error => {
        this.toastr.error(error);
      });
    });

    // Subsribe to the event that 'New Quote' in header gets clicked
    // when a new quote is being created.
    this.safeSubscribe(this.headerService.getNewQuoteObservable()).subscribe(action => {
      this.guardModalQuestion = this.translate.instant('guard.createNewQuote');
      this.guardModal.show()
        .then(result => {
          if (result) {
            this.navService.reload();
          }
      });
    });
  }

  public ngAfterViewInit() {
    // Needs to wait for quote and form to be completed first
    this.initPromise.then((quote: Quote) => {
      const businessInfo = this.businessInfo;

      // Call web services required for all type of quotes
      this.businessInfoService.getOptionsOfClaimQuestions().then(rsp => {
        if (rsp && rsp.hasOwnProperty('LOB')) {
          this.claimQuestionsOptions = rsp;
          // Claim stores all values with localized string.
          // Hence, massage claim questions options to support on both locales.
          this.claimQuestionsOptions.LossType[this.claimLossTypes[0]] = this.claimQuestionsOptions.LossType.Property;
          this.claimQuestionsOptions.LossType[this.claimLossTypes[1]] = this.claimQuestionsOptions.LossType.Casualty;
          if (quote) {
            const claims = quote.getClaims;
            if (claims) {
              claims.forEach(claim => {
                const lobId = this.claimQuestionsOptions.LOB.findIndex(lob => claim.lineOfBusiness === lob.Locale.Description);
                claim.lineOfBusinessId = lobId >= 0 ? lobId : null;
                if (claim.lineOfBusinessId !== null) {
                  const lossTypeId = this.claimQuestionsOptions.LossType[this.claimLossTypes[claim.lineOfBusinessId]]
                    .findIndex(lossType => claim.lossType === lossType.Locale.Description);
                  claim.lossTypeId = lossTypeId >= 0 ? lossTypeId : null;
                }
                const statusId = this.claimQuestionsOptions.Status.findIndex(status => claim.status === status.Locale.Description);
                claim.statusId = statusId >= 0 ? statusId : null;
              });
              this.copyClaims(claims);
            }
          }
        }
      }).catch(e => {
        this.toastr.error(this.translate.instant('business.claims.notification.getQustionsOptionsError'));
      });

      // Do nothing further for new quote
      if (!businessInfo || !businessInfo.quoteNumber) {
        return;
      }

      this.safeSubscribe(this.brokerSearchService.search(businessInfo.brokerCode))
        .subscribe(brokerInfos => {
          if (brokerInfos && brokerInfos.length) {
            const brokerInfo = brokerInfos[0];
            if (brokerInfo) {
              const item = this.brokerSearchService.getAutocompleteItem(brokerInfo);
              this.brokerInfoText = item.title;
              this.updateBroker({
                item: item
              });
            }
          }
        });

      const address = this.addressSearchService.getAddressSuggestion(businessInfo.companyAddress);
      if (address) {
        const item = this.addressSearchService.getAutocompleteItem(address);
        this.addressInfoText = item.title;
        this.updateAddress({
          item: address,
          isCopy: true
        });
      }

      if (businessInfo.isMailingDifferent) {
        this.showMailingAddressAutoCompleter = true;
        this.addAddressFormGroup('mailingAddress');
        this.addAutoCompleterControl('mailingAddressAutoCompleter');
        const mailing = this.addressSearchService.getAddressSuggestion(businessInfo.mailingAddress);
        if (mailing) {
          const item = this.addressSearchService.getAutocompleteItem(mailing);
          this.mailingInfoText = item.title;
          this.updateAddress({
            item: mailing,
            isCopy: true
          });
        }
      }
    }).catch(error => {
      this.toastr.error(error);
    });
  }

  public canDeactivate(): Promise<boolean> {
    if (!this.isFormDirty()) {
      return Promise.resolve(true);
    } else {
      this.guardModalQuestion = this.translate.instant('guard.navigateMessage');
      return this.guardModal.show();
    }
  }

  protected togglePayrollRevenue(ratingBasis: string) {
    // Member industryRatingInfo has been life-updated from template.
    super.togglePayrollRevenue(ratingBasis);
  }

  protected addToast(success?: boolean, redirect?: boolean, error?: any) {
    if (success) {
      this.toastr.success(
        this.translate.instant('business.notifications.saveSuccess')
      ).then(toast => {
        if (redirect) {
          setTimeout(() => {
            let url = '/coverageInfo';
            if (this.quoteNumber) {
              url += '/' + this.quoteNumber;
            }
            this.navigateTo([url]);
          }, 2000);
        }
      });
    } else if (error) {
      this.toastr.error(error.message);
    } else {
      this.toastr.error(
        this.translate.instant('business.notifications.saveError'));
    }
  }

  private onBlurBusinessName(event) {
    let name = event.target.value.trim();
    if (name !== this.businessNameCache) {
      this.businessNameCache = name;
      this.checkIfCallGDMService();
    }
  }

  /**
   * Check if business name and address fields are present before making D&B GDM call
   */
  private checkIfCallGDMService() {
    let addressControls = this.businessInfoForm.controls.companyAddress as FormGroup;
    if (this.businessInfoForm.controls.namedInsured.value && addressControls.get('streetAddress').value &&
      addressControls.get('city').value && addressControls.get('province').value &&
      addressControls.get('postalCode').value) {
      this.lookupBusiness();
    }
  }

  private lookupBusiness() {
    this.clearGdmRelatedFields();  // clear GDM related form fields or quote object fields
    let addressControl = this.businessInfoForm.controls.companyAddress;
    // country field in not mandatory so the value could be not present in addressControl.
    // If it is in that case, set the default value to be Canada.
    let country = addressControl.value.country || 'Canada';
    this.toastr.info(
      this.translate.instant('business.details.DnB.pending'),
      null,
      { dismiss: 'controlled' }
    ).then(toast => {
      this.businessInfoService.lookUpBusiness(this.businessInfoForm.controls.namedInsured.value,
        addressControl.value.streetAddress, addressControl.value.city,
        addressControl.value.province, country).then(dnbResponse => {
          if (dnbResponse && dnbResponse.length) {
            this.dnbResponse = dnbResponse;
            if (this.dnbResponse.length === 1) {
              this.getDnBBusinessDetails(this.dnbResponse[0].getDunsNbr, toast);
            } else {
              this.toastr.dismissToast(toast);
              this.toastr.error(
                this.translate.instant('business.details.DnB.DunsNumber.error.moreThanOneFound'));
            }
          } else {
            this.toastr.dismissToast(toast);
            this.toastr.error(
              this.translate.instant('business.details.DnB.DunsNumber.error.notFound'));
          }
        }).catch(e => {
          this.toastr.dismissToast(toast);
          this.toastr.error(
            this.translate.instant('business.details.DnB.DunsNumber.error.exception'));
        });
    });
  }

  /**
   * Call D&B GDM service to populate some busines-details fields.
   * Upon a successful call, a toast message indicates what fields are returned and
   * the all these input fields are populated with the returned values.
   * Otherwise, an error toast message shows.
   */
  private getDnBBusinessDetails(dunsNum: string, oldToast: Toast) {
    this.businessInfoService.getBusinessInfoByDunsNum(dunsNum).then(gdmResponse => {
      this.toastr.dismissToast(oldToast);
      if (gdmResponse) {
        this.setGdmRelatedFields(gdmResponse);  // set values of GDM related form fields or quote object fields
        const title = this.translate.instant('business.details.DnB.GDM.success');
        let toastMsg = `<h5><strong>${title}</strong></h5><ul>`;
        Object.keys(gdmResponse).forEach(field => {
          if (gdmResponse[field]) {
            const message =
              this.translate.instant('business.details.DnB.fieldsTranslate.' + field);
            toastMsg += `<li>${message}</li>`;
          }
        });
        toastMsg += '</ul>';
        this.toastr.success(
          toastMsg, null, { enableHTML: true, toastLife: 10000 });
      } else {
        this.toastr.error(
          this.translate.instant('business.details.DnB.GDM.error.notFound'));
      }
    }).catch(e => {
      this.toastr.dismissToast(oldToast);
      this.toastr.error(
        this.translate.instant('business.details.DnB.GDM.error.exception'));
    });
  }

  private clearGdmRelatedFields() {
    this.businessInfoForm.controls.yearsInBusiness.reset();
    this.businessInfo.businessDetails.numOfEmployees = null;
    this.businessInfo.businessDetails.suitJudgementExists = null;
    this.businessInfo.businessDetails.financialStressScore = null;
    this.businessInfo.businessDetails.commercialCreditScore = null;
  }

  private setGdmRelatedFields(gdm: GDM) {
    this.businessInfoForm.controls.yearsInBusiness.setValue(gdm.yearsInBusiness);
    this.businessInfo.businessDetails.numOfEmployees = gdm.numOfEmployees;
    this.businessInfo.businessDetails.suitJudgementExists = gdm.suitJudgementExists;
    this.businessInfo.businessDetails.financialStressScore = gdm.financialStressScore;
    this.businessInfo.businessDetails.commercialCreditScore = gdm.commercialCreditScore;
  }

  private addNameIssured(): void {
    if (this.businessInfo.legalNames && this.businessInfo.legalNames.length < 5) {
      this.businessInfo.legalNames.push(new LegalName());
    }
  }

  private onSelectBusinessSetup(id): void {
    this.businessSetup.forEach(item => {
      if (item.id === id) {
        item.selected = true;
        this.businessInfo.businessSetup = item.name;
        this.businessInfoForm.controls.businessSetup.setValue(item.name);
      } else {
        item.selected = false;
      }
    });
  }

  private selectBusinessSetup(name: string): void {
    this.businessSetup.forEach(item => {
      if (item.name === name) {
        item.selected = true;
        this.businessInfo.businessSetup = item.name;
        this.businessInfoForm.controls.businessSetup.setValue(item.name);
      } else {
        item.selected = false;
      }
    });
  }

  private onSelectOperating(): void {
    this.showOperatingName = !this.showOperatingName;
    if (this.showOperatingName) {
      this.addExtraBusinessNameControls();
    } else {
      this.removeExtraBusinessNameControls();
    }
  }

  private onSelectMailingAddress(flag: boolean): void {
    if (flag !== this.businessInfo.isMailingDifferent) {
      if (flag === false) {
        this.removeMailingAddressFormGroup();
        this.removeAutoCompleterControl('mailingAddressAutoCompleter');
        this.businessInfo.isMailingDifferent = false;
      } else {
        this.addAddressFormGroup('mailingAddress');
        this.addAutoCompleterControl('mailingAddressAutoCompleter');
        this.businessInfo.isMailingDifferent = true;
        this.showMailingAddressAutoCompleter = true;
      }
    }
  }

  private onChangeYearsInBusiness(event): void {
    const yearInput = event.target.value;
    const yearsInRelevantBusinessField = this.businessInfoForm.controls.yearsInRelevantBusiness;

    if (yearInput < MIN_YEARS_IN_BUSINESS && !this.showYearsInRelevantBusiness) {
      yearsInRelevantBusinessField.setValue(null);
      this.showYearsInRelevantBusiness = true;
    } else if (yearInput >= MIN_YEARS_IN_BUSINESS) {
      this.showYearsInRelevantBusiness = false;
      yearsInRelevantBusinessField.setValue(0);
    }
  }

  private onSelectIfPolicyCancelled(flag: boolean): void {
    this.businessInfo.wasPolicyCancelled = flag;
    this.businessInfoForm.controls.wasPolicyCancelled.setValue(flag);
  }

  private onSelectOverClaimLimit(flag: boolean): void {
    this.businessInfo.overClaimLimit = flag;
    this.businessInfoForm.controls.overClaimLimit.setValue(flag);
  }

  private onSelectClaimsNumber(numOfClaims: number): void {
    this.businessInfoForm.controls.numOfClaims.setValue(numOfClaims);
    this.removeClaims();

    this.overClaimLimit = numOfClaims > MIN_NUM_CLAIMS && numOfClaims < MAX_NUM_CLAIMS;

    if (numOfClaims > MIN_NUM_CLAIMS && numOfClaims < MAX_NUM_CLAIMS) {
      this.addClaims(numOfClaims);
    }
    this.selectNumOfClaims(numOfClaims);
  }

  private selectNumOfClaims(numOfClaims: number): void {
    this.claimOptions.forEach(item => {
      if (item.value === numOfClaims) {
        item.selected = true;
      } else {
        item.selected = false;
      }
    });
  }

  private getClaimLobType(lobValue: string) {
    return this.claimLossTypes[lobValue];
  }

  private getClaimLobTypeByIdx(claimIdx: string) {
    const control = this.businessInfoForm.get('claims').get('claim-' + claimIdx);
    return this.getClaimLobType(String(control.get('lineOfBusiness').value));
  }

  private onUpdateClaimLOB(event, claim: Claim, claimIdx: number) {
    let control = this.businessInfoForm.get('claims').get('claim-' + claimIdx);
    const lossTypeCtrl = control.get('lossType');
    lossTypeCtrl.reset();
    lossTypeCtrl.enable();
    claim.lineOfBusiness = this.getClaimLobDescription(String(event.target.value));
  }

  private onUpdateLossDate(newDate: Date, claim: Claim, claimIdx: number) {
    this.businessInfoForm.get('claims').get('claim-' + claimIdx).get('lossDate').setValue(newDate);
    claim.lossDate = newDate;
  }

  private getClaimLobDescription(id: string): string {
    return this.claimQuestionsOptions.LOB[id].Locale.Description;
  }

  private getClaimStatusDescription(id: string): string {
    return this.claimQuestionsOptions.Status[id].Locale.Description;
  }

  private getClaimLossTypeDescription(lob: string, id: string): string {
    return this.claimQuestionsOptions.LossType[this.getClaimLobType(lob)][id].Locale.Description;
  }

  private saveModel() {
    // Retrieve values from date-quote
    this.businessInfo.effectiveDate = this.dateQuoteInfo.effectiveDate;
    this.businessInfo.expiryDate = this.dateQuoteInfo.expiryDate;
    this.businessInfo.quoteNumber = this.dateQuoteInfo.quoteNumber;

    // Retrieve values from industry-rating
    this.businessInfo.industryCode = this.industryRatingInfo.industryCode;
    this.businessInfo.industryCodeDescription = this.industryRatingInfo.industryCodeDescription;
    this.businessInfo.ratingBasis = this.industryRatingInfo.ratingBasis;

    // Set values from the rest of business info
    let formControls = this.businessInfoForm.controls;
    // Save revenues or payrolls
    if ('PY' === this.businessInfo.ratingBasis) {
      this.businessInfo.annualPayrollCA = formControls.annualPayrollCA.value;
      this.businessInfo.annualRevenueCA = null;
      this.businessInfo.annualRevenueUS = 0;
      this.businessInfo.annualRevenueFO = 0;
    } else {
      this.businessInfo.annualRevenueCA = formControls.annualRevenueCA.value;
      this.businessInfo.annualRevenueUS = formControls.annualRevenueUS.value;
      this.businessInfo.annualRevenueFO = formControls.annualRevenueFO.value;
      this.businessInfo.annualPayrollCA = null;
    }

    this.businessInfo.operatingName = !!formControls.operatingName ? formControls.operatingName.value : '';
    this.businessInfo.relationToInsured = !!formControls.relationToInsured ? formControls.relationToInsured.value : '';
    this.businessInfo.namedInsured = formControls.namedInsured.value;
    if (this.businessInfo.relationToInsured) {
      this.businessInfo.displayBusinessName = this.translate.instant(
        `business.details.title.displayBusinessName.${formControls.relationToInsured.value}`,
        {
          namedInsured: this.businessInfo.namedInsured,
          operatingName: this.businessInfo.operatingName
        }
      );
    } else {
      this.businessInfo.displayBusinessName = this.businessInfo.namedInsured;
    }
    this.businessInfo.numOfClaims = parseInt(formControls.numOfClaims.value, 10);
    this.businessInfo.yearsInRelevantBusiness = formControls.yearsInRelevantBusiness.value;
    this.businessInfo.brokerContactName = formControls.brokerContactName.value;
    this.businessInfo.brokerContactEmail = formControls.brokerContactEmail.value;
    this.businessInfo.businessDetails.yearsInBusiness = formControls.yearsInBusiness.value;
    //  Company Address
    this.saveAddressToModel(this.businessInfo.companyAddress, formControls.companyAddress);
    //  Mailing Address
    if (this.businessInfo.isMailingDifferent) {
      this.saveAddressToModel(this.businessInfo.mailingAddress, formControls.mailingAddress);
    } else {
      let mailingAddress = this.businessInfo.mailingAddress;
      if (mailingAddress.streetAddress) {
        mailingAddress = new Address();
      }
    }

    // Claims
    if (Array.isArray(this.claims)) {
      const claimList = this.businessInfoForm.get('claims');
      this.claims.forEach((claim, i) => {
        const claimControl = claimList.get('claim-' + i);
        const lobValue = claimControl.get('lineOfBusiness').value;
        // Convert id back to localized string
        claim.lineOfBusiness = this.getClaimLobDescription(lobValue);
        claim.status = this.getClaimStatusDescription(claimControl.get('status').value);
        claim.lossType = this.getClaimLossTypeDescription(lobValue, claimControl.get('lossType').value);
      });
    }

    // Offering Code and LOB Codes
    if (this.offeringAndLobCodes) {
      this.businessInfo.offeringCode = this.offeringAndLobCodes.offeringCode;
      this.businessInfo.lobCodes = this.offeringAndLobCodes.lobCodes;
    }
  }

  private saveAddressToModel(address: Address, addressGroup: AbstractControl) {
    const unit = addressGroup.get('unitNumber').value;
    const add = addressGroup.get('streetAddress').value;

    if (unit) {
      address.streetAddress = add + ', ' + this.translate.instant('generic.address.title.unitNumberPre') + ' ' + unit;
    } else {
      address.streetAddress = add;
    }

    address.city = addressGroup.get('city').value;
    address.province = addressGroup.get('province').value;
    address.country = addressGroup.get('country').value || 'Canada';
    address.postalCode = addressGroup.get('postalCode').value;
  }

  /**
   * Function called when 'Save' or 'Next' Button is clicked.
   */
  private onSave(navigateToNextPage?: boolean) {
    this.notifier.next('onSave');
    this.showControlsErrorsIfAny = true;
    if (this.businessInfoForm.valid) {
      try {
        this.saveModel();
        this.saveBusinessInfoAndShowToast(navigateToNextPage);
      } catch (e) {
        this.addToast();
      }
    } else {
      this.toastr.error(
        this.translate.instant('business.notifications.fieldError'));
    }
  }

  /**
   * Function to call the webservice to save BusinessInfo
   * and show toast to highlight success or failure.
   */
  private saveBusinessInfoAndShowToast(navigateToNextPage: boolean) {
    this.toggleSpinner();
    try {
      this.businessInfoService.saveBusinessInfo(this.businessInfo, this.claims).then(response => {
        if (response && response.status === 'ok') {
          const result = response.result;
          const currentQuoteNumber = this.quoteNumber;
          if (result._id) {
            this.quoteNumber = result._id;
          }
          this.businessInfoForm.markAsPristine();
          this.addToast(true, navigateToNextPage);
          if (currentQuoteNumber !== this.quoteNumber) {
            this.urlLocation.replaceState('/quote/' + this.quoteNumber);
            this.notifier.next('copyIsSaved');
          }
        } else {
          this.addToast(false, navigateToNextPage, response.error);
        }
        this.toggleSpinner();
      }).catch(e => {
        this.addToast(false, navigateToNextPage);
        this.toggleSpinner();
      });
    } catch (ex) {
      console.log('Error saving model');
      this.toggleSpinner();
    }
  }

  private updateAddress(event) {
    let controls = this.businessInfoForm.controls;
    if (event) {
      if (event.isCopy) {
        this.copyAddress(controls.companyAddress, event.item);
      } else {
        this.setAddress(controls.companyAddress, event.item);
        this.checkIfCallGDMService();
      }
    }
  }

  private updateMailingAddress(event) {
    let controls = this.businessInfoForm.controls;
    if (event) {
      if (event.isCopy) {
        this.copyAddress(controls.mailingAddress, event.item);
      } else {
        this.setAddress(controls.mailingAddress, event.item);
      }
    }
  }

  private changeAddressDetails(addType: string) {
    this.getProvinceOptions();
    if (addType === 'location') {
      this.showCompanyAddressAutoCompleter = false;
      this.removeAutoCompleterControl('locationAddressAutoCompleter');
    } else if (addType === 'mailing') {
      this.showMailingAddressAutoCompleter = false;
      this.removeAutoCompleterControl('mailingAddressAutoCompleter');
    }
  }

  /**
   * Copy company address
   * @param addressGroup address form group
   * @param companyAddress Company Address
   */
  private copyAddress(addressGroup: AbstractControl, companyAddress: AddressInfo) {
    this.clearAddressFormGroupValues(addressGroup);
    addressGroup.get('city').setValue(companyAddress.City);
    addressGroup.get('province').setValue(companyAddress.StateProvince);
    addressGroup.get('country').setValue(companyAddress.Country);
    addressGroup.get('postalCode').setValue(companyAddress.PostalCode);
    addressGroup.get('streetAddress').setValue(companyAddress.AddressLine1);
  }

  /**
   * Process Pitney Bowes result and set result values to address controls
   * @param addressGroup address form group
   * @param result Pitney Bowes result
   */
  private setAddress(addressGroup: AbstractControl, result: any) {
    this.clearAddressFormGroupValues(addressGroup);
    addressGroup.get('city').setValue(result.City);
    addressGroup.get('province').setValue(result.StateProvince);
    addressGroup.get('country').setValue(result.Country);
    addressGroup.get('postalCode').setValue(result.PostalCode);
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
    let streetAddressControl = addressGroup.get('streetAddress');
    if (unitNumber) {
      addressGroup.get('unitNumber').setValue(unitNumber);
      let regex2 = new RegExp(result.ApartmentLabel2 + '-*');
      let streetAddress: string = result.AddressLine1;
      // Remove unit number and '-' from street address and set it to control value
      streetAddressControl.setValue(streetAddress.replace(regex2, '').trim());
    } else {
      streetAddressControl.setValue(result.AddressLine1);
    }
  }

  private updateBroker(event) {
    if (event && event.item) {
      this.businessInfo.brokerCode = event.item.id;
      this.businessInfo.brokerName = event.item.Name;
    }
  }

  private wasPolicyCancelledChange(selected) {
    this.businessInfo.wasPolicyCancelled = selected;
  }

  private getProvinceOptions() {
    if (!this.provinceOptions) {
      this.businessInfoService.getProvinceOptions().then(rsp => {
        if (rsp && Array.isArray(rsp)) {
          this.provinceOptions = rsp;
        }
      }).catch(e => {
        this.toastr.error(
          this.translate.instant('business.claims.notification.getProvinceOptionsError'));
      });
    }
  }

  private toggleSpinner() {
    this.ifShowSpinner = !this.ifShowSpinner;
  }

  private setBrokerLoading(isLoading: boolean) {
    this.brokerInfoLoading = isLoading;
    this.brokerInfoNoMatch = false;
  }

  private setBrokerNoMatch(isNoMatch: boolean) {
    this.brokerInfoNoMatch = isNoMatch;
    this.brokerInfoLoading = false;
  }

  private onBlurBroker() {
    if (this.brokerInfoNoMatch) {
      this.businessInfoForm.controls.brokerCode.reset();
    }
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
      this.businessInfoForm.controls.locationAddressAutoCompleter.reset();
    }
  }

  private setMailingLoading(isLoading: boolean) {
    this.mailingInfoLoading = isLoading;
    this.mailingInfoNoMatch = false;
  }

  private setMailingNoMatch(isNoMatch: boolean) {
    this.mailingInfoNoMatch = isNoMatch;
    this.mailingInfoLoading = false;
  }

  private onBlurMailingAddress() {
    if (this.mailingInfoNoMatch) {
      this.businessInfoForm.controls.mailingAddressAutoCompleter.reset();
    }
  }
}
