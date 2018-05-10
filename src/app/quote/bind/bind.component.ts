import { OnInit, Component, ViewChild } from '@angular/core';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { TranslateService } from 'ng2-translate';
import { BaseFormComponent } from '../../base';
import { BindService } from './bind.service';
import { BindForm, BindType, BindInfo, Address, Quote } from '../models';
import { InfoCard } from '../shared/info-card/info-card.model';
import { PremiumDetails } from '../shared/premium-details/premium-details.model';
import { AddressSearchService, AddressService } from '../shared/address';
import { DeactivateGuardInterface } from '../../routing/authentication/deactivate-guard.interface';

@Component({
  selector: 'bind',
  styleUrls: ['./bind.component.scss'],
  templateUrl: './bind.component.html',
  providers: [BindService, AddressSearchService, AddressService]
})
export class BindComponent extends BaseFormComponent implements OnInit, DeactivateGuardInterface {
  protected quoteNumber: string;
  protected isUWJourney: boolean = true;

  @ViewChild('guardModal') private guardModal;
  @ViewChild('payeeMortgageeModal') private payeeMortgageeModal;

  private guardModalQuestion: string;
  private ifShowSpinner: boolean = false;
  private bindForm: FormGroup;
  private isReady: boolean;
  private showErrors: boolean = false;
  private types: any[];
  private quote: Quote;
  private businessInfoCard: InfoCard;
  private brokerInfoCard: InfoCard;
  private premiumInfoCard: PremiumDetails;
  private showBindParty = false;
  private agencyBillSelected = true;

  constructor(
    protected router: Router,
    protected toastr: ToastsManager,
    protected bindService: BindService,
    protected translate: TranslateService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder
  ) {
    super(translate, router);
  }

  public ngOnInit() {
    this.toggleSpinner();
    this.safeSubscribe(this.route.params)
      .subscribe((params: Params) => {
        this.isReady = false;
        this.quoteNumber = params['quoteNumber'];

        const quotePromise: Promise<Quote> = new Promise((resolve, reject) => {
          if (!this.quoteNumber) {
            resolve();
          } else {
            this.bindService.getQuote(this.quoteNumber).then(response => {
              resolve(response);
            }).catch(error => {
              this.toastr.error(this.translate.instant('bind.toast.getQuoteError', { quoteNumber: this.quoteNumber }));
            });
          }
        });

        quotePromise.then((quote: Quote) => {
          this.quote = quote;
          this.prepareBusinessInfoCard();
          this.prepareBrokerInfoCard();
          this.preparePremiumInfoCard();
          this.initializeBindForm();
          this.isReady = true;
          this.toggleSpinner();
        });
      });

  }

  public canDeactivate(): Promise<boolean> {
    if (this.bindForm.pristine) {
      return Promise.resolve(true);
    } else {
      this.guardModalQuestion = this.translate.instant('guard.navigateMessage');
      return this.guardModal.show();
    }
  }

  protected onUnbind() {
    this.toggleSpinner();
    this.bindService.unbind(this.quoteNumber)
      .then(response => {
        this.toastr.success(this.translate.instant('bind.toast.unbindSuccess',
          {quoteNumber: this.quoteNumber}), null, { toastLife: 5000 });
        this.toggleSpinner();
        this.navigateTo(['/summary/'.concat(this.quoteNumber)]);
      }).catch(e => {
        this.toastr.error(this.translate.instant('bind.toast.unbindError',
          {quoteNumber: this.quoteNumber}));
        this.toggleSpinner();
      });
  }

  protected toggleSpinner() {
    this.ifShowSpinner = !this.ifShowSpinner;
  }

  private initializeBindForm() {
    this.bindForm = this.formBuilder.group({
      bindPartyArray: this.formBuilder.array([])
    });
    // initialize bindPartyArray with saved loss payees/mortgagees
    const bindInfo: BindInfo = this.quote.getBindInfo;
    if (bindInfo) {
      Object.keys(bindInfo).forEach(item => {
        bindInfo[item].forEach(bindParty => {
          const bindPartyArray = this.bindForm.controls.bindPartyArray;
          this.bindService.addPayeeMortgagee(bindPartyArray as FormArray, bindParty);
        });
      });
    }
  }

  private addPayeeMortgagee() {
    if (this.isUWJourney) {
      this.bindService.addPayeeMortgagee(this.bindForm.controls.bindPartyArray as FormArray);
      this.showBindParty = true;
    } else {
      this.payeeMortgageeModal.show();
    }
  }

  private deleteBindParty(formId: number) {
    const formArray = this.bindForm.controls.bindPartyArray as FormArray;
    const index = formArray.value.findIndex(form => form.id === formId);
    if (index > -1) {
      this.guardModalQuestion = this.translate.instant('guard.deleteConfirmation');
      this.guardModal.show()
        .then(result => {
          if (result) {
            const bindParty = formArray.at(index);
            if (this.bindService.isMortgageeOption(bindParty.value.bindType)) {
              this.bindService.enableMortgageeOption(bindParty.value.bindType);
            }
            formArray.removeAt(formArray.value.findIndex(form => form.id === formId));
            this.bindForm.markAsDirty();
          }
      });
    }
  }

  private isLastFormValid(): boolean {
    const bindPartyArray = this.bindForm.controls.bindPartyArray as FormArray;
    const arrayLength = bindPartyArray.length;
    if (bindPartyArray.length) {
      return bindPartyArray.at(bindPartyArray.length - 1).valid;
    } else {
      return true;
    }
  }

  private onSave() {
    this.showErrors = true;
    if (this.bindForm.valid) {
      this.toggleSpinner();
      const lossPayeeArray: BindForm[] = [];
      const mortgageeArray: BindForm[] = [];
      const bindPartyArray = this.bindForm.controls.bindPartyArray as FormArray;
      for (let i = 0; i < bindPartyArray.length; i++) {
        const bindPartyGroup = bindPartyArray.at(i) as FormGroup;
        const bindType = bindPartyGroup.value.bindType;
        const bindParty = this.processBindParty(bindPartyGroup);
        if (this.bindService.isMortgageeOption(bindType)) {
          mortgageeArray.push(bindParty);
        } else if (this.bindService.isPayeeOption(bindType)) {
          lossPayeeArray.push(bindParty);
        }
      }

      const quoteDates = this.bindForm.controls.quoteDates;
      this.bindService.save(lossPayeeArray, mortgageeArray, this.quoteNumber,
        quoteDates.value.effectiveDt, quoteDates.value.expiryDt)
        .then(response => {
          if (response && response.status === 'ok') {
            this.toastr.success(this.translate.instant('bind.saveSuccess'));
            this.bindForm.markAsPristine();
          } else {
            this.toastr.error(this.translate.instant('bind.saveFailure'));
          }
          this.toggleSpinner();
        }).catch(e => {
          this.toastr.error(this.translate.instant('bind.saveFailure'));
          this.toggleSpinner();
        });
    } else {
      this.toastr.error(this.translate.instant('bind.toast.fieldError'));
    }
  }

  private processBindParty(bindPartyGroup: FormGroup): BindForm {
    const bindParty = new BindForm();
    const bindType = bindPartyGroup.value.bindType;
    bindParty.name = bindPartyGroup.value.bindName;
    bindParty.type = bindPartyGroup.value.bindType;
    bindParty.value = this.bindService.lookupBindTypeTitle(bindPartyGroup.value.bindType);
    const addressGroup = bindPartyGroup.controls.address as FormGroup;
    const addressFields = addressGroup.controls.addressFields as FormGroup;
    this.setAddress(addressFields, bindParty.address);
    return bindParty;
  }

  private setAddress(addressGroup: FormGroup, address: Address) {
    address.streetAddress = addressGroup.value.streetAddress;
    address.city = addressGroup.value.city;
    address.province = addressGroup.value.province;
    address.postalCode = addressGroup.value.postalCode;
    address.country = 'Canada'; // Only accept Canadian address
  }

  private onIssue() {
    // Todo: to be implemented after requirement is specify
  }

  private prepareBusinessInfoCard() {
    const businessInfo = this.quote.getBusinessInfo;
    const address = businessInfo.companyAddress;
    const addressFields = [
      address.streetAddress,
      address.city,
      address.province,
      address.postalCode
    ];
    this.businessInfoCard = new InfoCard(
      businessInfo.namedInsured,
      addressFields.join(', '),
      this.translate.instant('generic.businessDetails.title.description'),
      businessInfo.industryCodeDescription,
      this.translate.instant('generic.businessDetails.title.industryCode'),
      businessInfo.industryCode
    );
  }

  private prepareBrokerInfoCard() {
    const businessInfo = this.quote.getBusinessInfo;
    this.brokerInfoCard = new InfoCard(
      this.translate.instant('generic.brokerDetails.title.brokerage'),
      businessInfo.brokerName,
      this.translate.instant('generic.brokerDetails.title.contactName'),
      businessInfo.brokerContactName,
      this.translate.instant('generic.brokerDetails.title.contactEmail'),
      businessInfo.brokerContactEmail,
      this.translate.instant('generic.brokerDetails.headTitle')
    );
  }

  private preparePremiumInfoCard() {
    const businessInfo = this.quote.getBusinessInfo;
    this.premiumInfoCard = new PremiumDetails(
      businessInfo.effectiveDate,
      businessInfo.expiryDate,
      this.quote.getQuoteId,
      this.quote.getDeviation,
      this.quote.getDeviatedTotalPremium
    );
  }

  private onSelectAgencyBill(flag: boolean): void {
    this.agencyBillSelected = flag;
  }
}
