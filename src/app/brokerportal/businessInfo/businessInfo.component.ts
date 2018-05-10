import { Component, OnInit } from '@angular/core';
import { AddressSearchService } from '../../quote/businessInfo/address-search/address-search.service';
import { BrokerSearchService } from '../../quote/businessInfo/broker-search/broker-search.service';
import { IndustrySearchService } from '../../quote/businessInfo/industry-search/industry-search.service';
import { BusinessInfoService } from '../../quote/businessInfo/businessInfo.service';
import { HeaderService } from '../../header/header.service';
import { NavService } from '../../base/nav.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { TranslateService } from 'ng2-translate';
import { Location } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { BusinessInfoComponent, QuoteSearchService } from '../../quote';

@Component({
  selector: 'broker-business-info',
  templateUrl: '../../quote/businessInfo/businessInfo.component.html',
  providers: [
    AddressSearchService,
    BrokerSearchService,
    BusinessInfoService,
    IndustrySearchService,
    QuoteSearchService
  ]
})
export class BrokerBusinessInfoComponent extends BusinessInfoComponent implements OnInit {

  private industryCode: string;

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
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
    super(
      router,
      toastr,
      translate,
      urlLocation,
      formBuilder,
      addressSearchService,
      brokerSearchService,
      businessInfoService,
      headerService,
      navService
    );
  }

  public ngOnInit() {
    super.ngOnInit();
    this.safeSubscribe(this.route.queryParams)
      .subscribe((params: Params) => {
        this.industryCode = params['industryCode'];
        console.log('Industry code' + this.industryCode);
        if(this.industryCode && this.industryCode.length !== 0) {
          // this.showIndustryRating = false;
        }
      });
  }

  protected addToast(success?: boolean, redirect?: boolean, error?: any) {
    if (success) {
      this.toastr.success(
        this.translate.instant('business.notifications.saveSuccess')
      ).then(toast => {
        if (redirect) {
          this.urlLocation.replaceState('/broker/businessInfo/' + this.quoteNumber);
          this.togglePageView();
        }
      });
    } else if (error) {
      this.toastr.error(error.message);
    } else {
      this.toastr.error(
        this.translate.instant('business.notifications.saveError'));
    }
  }

  private togglePageView() {
    this.showBusinessInfo = !this.showBusinessInfo;
    this.showLobQuestions = !this.showLobQuestions;
  }
}
