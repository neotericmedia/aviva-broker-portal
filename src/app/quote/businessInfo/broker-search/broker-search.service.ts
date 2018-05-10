// todo: cleanup imports
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { BrokerInfo, BrokerInfoAutocompleteItem } from './broker-search.model';
import { deserialize } from 'serializer.ts/Serializer';
import { WebServiceURLs } from '../../../shared/webServiceURLs';

// TODO: Add base search service that handles timeout and debounce.
@Injectable()
export class BrokerSearchService {

  constructor(private http: Http) {
    this.http = http;
  }

  public getAutocompleteItem(brokerInfo: BrokerInfo): BrokerInfoAutocompleteItem {
    if (brokerInfo) {
      return new BrokerInfoAutocompleteItem(brokerInfo);
    }
  }

  public search(searchTerm: string): Observable<BrokerInfoAutocompleteItem[]> {
    return this.http.get(WebServiceURLs.getBrokerByTextUrl(searchTerm))
      .map(response => {
        const brokerInfos = deserialize<BrokerInfo[]>(BrokerInfo, response.json());
        if (brokerInfos && brokerInfos.length) {
          let brokerList = brokerInfos.map(broker => {
            return this.getAutocompleteItem(broker);
          });
          brokerList.sort(this.sortBrokers);
          return brokerList;
        } else {
          return [];
        }
      })
      .catch(err => {
        console.log('Failed to find broker info from broker code.');
        return Observable.of([]);
      });
  }

  private sortBrokers(bkr1: BrokerInfoAutocompleteItem, bkr2: BrokerInfoAutocompleteItem): number {
    if (bkr1._id > bkr2._id) {
      return 1;
    }
    if (bkr1._id < bkr2._id) {
      return -1;
    }
    return 0;
  }
}
