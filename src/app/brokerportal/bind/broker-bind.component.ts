import { Component, OnInit } from '@angular/core';
import { BindComponent, BindService } from '../../quote';
import { AddressSearchService } from '../../quote/businessInfo/address-search/address-search.service';
import { AddressService } from '../../quote/shared/address';

@Component({
  selector: 'broker-bind',
  templateUrl: '../../quote/bind/bind.component.html',
  providers: [
    AddressSearchService,
    AddressService,
    BindService
  ]
})
export class BrokerBindComponent extends BindComponent implements OnInit {

  public ngOnInit() {
    super.ngOnInit();
    this.isUWJourney = false;
  }

  protected onUnbind() {
    this.toggleSpinner();
    this.bindService.unbind(this.quoteNumber)
      .then(response => {
        this.toastr.success(this.translate.instant('bind.toast.unbindSuccess',
          {quoteNumber: this.quoteNumber}), null, { toastLife: 5000 });
        this.toggleSpinner();
        this.navigateTo(['broker/summary/'.concat(this.quoteNumber)]);
      }).catch(e => {
        this.toastr.error(this.translate.instant('bind.toast.unbindError',
          {quoteNumber: this.quoteNumber}));
        this.toggleSpinner();
      });
  }
}
