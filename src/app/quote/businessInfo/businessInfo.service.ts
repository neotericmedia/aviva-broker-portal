import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { serialize, deserialize } from 'serializer.ts/Serializer';
import { ActivatedRoute, Params, UrlSegment } from '@angular/router';
import { WebServiceURLs } from '../../shared/webServiceURLs';
import { DnBResponse, OfferingLobs, GDM, BusinessInfo, ClaimQuestionsOptions, Claim, Quote } from '../models';
import { QuoteSearchService } from '../search';
import { BaseComponent } from '../../base';

@Injectable()
export class BusinessInfoService extends BaseComponent {
  private routeParamsPromise: Promise<Params>;
  private routeUrlsPromise: Promise<UrlSegment[]>;
  private quotePromise: Promise<Quote | undefined>;
  private quote?: Quote;

  constructor(
    private route: ActivatedRoute,
    private http: Http,
    private quoteSearchService: QuoteSearchService
  ) {
    super();
    this.routeParamsPromise = new Promise((resolve, reject) => {
      this.safeSubscribe(route.params).subscribe((params: Params) => {
        resolve(params);
      });
    });

    this.routeUrlsPromise = new Promise((resolve, reject) => {
      this.safeSubscribe(route.url).subscribe((urlPaths: UrlSegment[]) => {
        resolve(urlPaths);
      });
    });

    this.quotePromise = new Promise((resolve, reject) => {
      this.routeParamsPromise.then((routeParams) => {
        const quoteNumber = routeParams['quoteNumber'];
        if (!quoteNumber) {
          resolve();
        } else {
          this.quoteSearchService.findByQuoteNumber(quoteNumber).then(response => {
            let businessInfo = response && response.getBusinessInfo;
            businessInfo.quoteNumber = quoteNumber;
            resolve(response);
          }).catch(error => {
            reject(error);
          });
        }
      }).catch(error => {
        reject(error);
      });
    });
  }

  public getRouteParams(): Promise<Params> {
    return this.routeParamsPromise;
  }

  public getRouteUrls(): Promise<UrlSegment[]> {
    return this.routeUrlsPromise;
  }

  public async isCopyingQuote() {
    const urlPaths = await this.getRouteUrls();
    return urlPaths && urlPaths.length === 3 && urlPaths[2].path === 'copy';
  }

  public async getQuote(): Promise<Quote | undefined> {
    return this.quotePromise;
  }
  /**
   * Function to call the D&B Lookup service
   * through the catalyst backend REST API.
   * @returns DUNS number
   */
  // tslint:disable-next-line:variable-name
  public lookUpBusiness(businessName: string, streetAddress: string, city: string,
    province: string, country: string): Promise<void | DnBResponse[]> {
    let path = WebServiceURLs.lookUpBusiness;
    let url = path + '?Name=' + businessName + '&Street_Address=' + streetAddress + '&Town=' + city +
      '&State_or_Region=' + province + '&Country_Code=' + country;
    return this.http.get(url)
      .toPromise()
      .then(response => deserialize<DnBResponse[]>(DnBResponse, response.json()));
  }

  /**
   * Function to save quote from the business Info page.
   * @returns Quote Id.
   */
  public saveBusinessInfo(businessInfo: BusinessInfo, claims: Claim[]): Promise<any> {
    let url = WebServiceURLs.saveBusinessInfo;
    return this.http.post(url, { businessInfo, claims: serialize(claims) })
      .toPromise()
      .then(response => {
        console.log('saveBusinessInfo response', response);
        return {
          status: 'ok',
          result: response.json()
        };
      }).catch(e => {
        const error = e.json();
        console.log('saveBusinessInfo catch', error);
        return {
          status: 'fail',
          error: error
        };
      });
  }

  /**
   * Function to call the D&B GDM service through the catalyst
   * backend REST API given the DUNS Number.
   * @param dunsNum: DUNS Number
   * @returns GDM Info
   */
  public getBusinessInfoByDunsNum(dunsNum: string): Promise<GDM> {
    let url = WebServiceURLs.GDM + dunsNum;
    return this.http.get(url)
      .toPromise()
      .then(response => {
        let rsp = response.json();
        let gdm = new GDM();

        gdm.numOfEmployees = rsp.RPT.TOT_EMPL;
        gdm.suitJudgementExists = rsp.RPT.SUIT_JDGT_IND;
        gdm.financialStressScore = rsp.RPT.FAIL_SCR_ENTR.SCR_GRP.SCR;
        gdm.commercialCreditScore = rsp.RPT.DELQ_SCR_ENTR.SCR_GRP.SCR;
        if (rsp.RPT.DCSN_INFO.DM_AGE) {
          gdm.yearsInBusiness = parseInt(rsp.RPT.DCSN_INFO.DM_AGE, 10);
        }

        return gdm;
      });
  }

  public getLOBs(code: string): Promise<OfferingLobs> {
    let url = WebServiceURLs.offeringLOBs + code;
    return this.http.get(url)
      .toPromise()
      .then(response => deserialize<OfferingLobs>(OfferingLobs, response.json()));
  }

  // Todo: Change to backend-driven
  public getBusinessSetUp(): any {
    return [{
      id: 1,
      name: 'individual'
    }, {
      id: 2,
      name: 'partnership'
    }, {
      id: 3,
      name: 'corporation'
    }, {
      id: 4,
      name: 'jointventure'
    }];
  }

  // Todo: Change to backend-driven
  public getRelationOptions() {
    return [{
      id: 1
    }, {
      id: 2
    }, {
      id: 3
    }, {
      id: 4
    }, {
      id: 5
    }, {
      id: 6
    }, {
      id: 7
    }, {
      id: 8
    }];
  }

  public quoteNumberExists(quoteNumber: string): Promise<any> {
    const url = WebServiceURLs.findAllVersionsOfQuoteNumber + quoteNumber;
    return this.http.get(url)
      .toPromise()
      .then(response => {
        const quoteDocs = response.json();
        return quoteDocs;
      }).catch(err => {
        return [];
      });
  }

  /**
   * Function to retrieve dropdown options for claim questions
   */
  public getOptionsOfClaimQuestions(): Promise<ClaimQuestionsOptions | void> {
    let url = WebServiceURLs.claimFieldControls;
    return this.http.get(url)
      .toPromise()
      .then(response => deserialize<ClaimQuestionsOptions>(ClaimQuestionsOptions, response.json()));
  }

  /**
   * Function to retrieve dropdown options for province field
   */
  public getProvinceOptions() {
    let url = WebServiceURLs.provinceFieldControls;
    return this.http.get(url)
      .toPromise()
      .then(response => response.json());
  }

  // Todo: manage Broker-related apis
  public getClaimOptions(): any {
    return [{
      value: 0
    }, {
      value: 1
    }, {
      value: 2
    }, {
      value: 3
    }];
  }
}
