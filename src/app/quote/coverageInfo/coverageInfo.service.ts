import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { serialize, deserialize } from 'serializer.ts/Serializer';
import { TranslateService } from 'ng2-translate';
import {
  ConstructionOption,
  BurglaryAlarmOption,
  FUSResponse,
  LobQuestion,
  OfferingLOBCoverage,
  RatabaseZonesResponse
} from '../models';
import { WebServiceURLs } from '../../shared/webServiceURLs';

@Injectable()
export class CoverageInfoService {

  constructor(protected http: Http, protected translate: TranslateService) {
  }

  /**
   * Get Coverages by Offering, Province for multiple LOBs grouped by LOB
   * @param quoteNumber - quote number to fetch LOBs
   * @return List of LOB details
   */
  public loadLOBs(quoteNumber: string): Promise<OfferingLOBCoverage[]> {
    return this.http.get(WebServiceURLs.getOfferingLobsAndCoverages(quoteNumber))
      .toPromise()
      .then(response => {
        const offeringCoverages = deserialize<OfferingLOBCoverage[]>(OfferingLOBCoverage, response.json());
        offeringCoverages.sort(this.sortLOBs);
        return offeringCoverages;
      })
      .catch(e => {
        console.log('Failed to load LOBs\' coverage details');
        throw e;
      });
  }

  /**
   * Get Coverages with zone property
   * @return List of LOB details
   */
  public loadZones(quoteNumber: string): Promise<RatabaseZonesResponse[]> {
    let url = WebServiceURLs.loadCoveragesWithZones + '/' + quoteNumber;
    return this.http.get(url)
      .toPromise()
      .then(response => deserialize<RatabaseZonesResponse[]>(RatabaseZonesResponse, response.json()))
      .catch(e => {
        console.log('Failed to load Coverages with zone property.');
        throw e;
      });
  }

  public getFUS(quoteNumber: string): Promise<void | FUSResponse> {
    let url = WebServiceURLs.iclarify + '/' + quoteNumber;
    return this.http.get(url)
      .toPromise()
      .then(response => deserialize<FUSResponse>(FUSResponse, response.json()))
      .catch(e => {
        console.log('Failed to get FUS result.');
        throw e;
      });
  }

  public getLobQuestions(lobCodes?: string[]): Promise<LobQuestion[]> {
    const url = WebServiceURLs.getLobQuestionsUrl(lobCodes);
    return this.http.get(url)
      .toPromise()
      .then(response => deserialize<LobQuestion[]>(LobQuestion, response.json()))
      .catch(e => {
        console.log('Failed to load LOB questions');
        throw e;
      });
  }

  public saveCoverageInfo(requestData: any, quoteNumber: string): Promise<any> {
    const url = WebServiceURLs.getSaveCoverageInfoUrl(quoteNumber);
    return this.http.post(url, serialize(requestData))
      .toPromise()
      .then(response => {
        console.log('saveCoverageInfo response', response);
        return {
          status: 'ok'
        };
      }).catch(e => {
        console.log('saveCoverageInfo catch');
        return {
          status: 'fail',
          error: e.json()
        };
      });
  }

  private sortLOBs(Lob1: OfferingLOBCoverage, Lob2: OfferingLOBCoverage): number {
    if (Lob1.LOB.LOBSequence > Lob2.LOB.LOBSequence) {
      return 1;
    } else if (Lob1.LOB.LOBSequence < Lob2.LOB.LOBSequence) {
      return -1;
    } else {
      return 0;
    }
  }
}
