import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { WebServiceURLs } from '../../../shared/webServiceURLs';
import { TranslateService } from 'ng2-translate';
import { ToastsManager, Toast } from 'ng2-toastr/ng2-toastr';

@Injectable()
export class AddressService {
  private provinceArray: any[];

  constructor(
    private http: Http,
    private toastr: ToastsManager,
    private translate: TranslateService
  ) {
    //  get province array for province field dropdown menu
    this.http.get(WebServiceURLs.provinceFieldControls).toPromise()
      .then(res => {
        this.provinceArray = res.json();
      }).catch(e => {
        this.translate.get('generic.getProvinceOptionsError').subscribe((res: string) => {
          this.toastr.error(res);
        });
      });
  }

  public getProvinceAttay(): any[] {
    return this.provinceArray;
  }
}
