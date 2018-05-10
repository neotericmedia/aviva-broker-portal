import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { Injectable } from '@angular/core';
import { Headers, Http, URLSearchParams, Response, RequestOptions } from '@angular/http';
import { AddressInfo, AddressInfoAutocompleteItem } from './address-search.model';
import { deserialize } from 'serializer.ts/Serializer';
import { WebServiceURLs } from '../../../shared/webServiceURLs';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class AddressSearchService {

  constructor(private http: Http) {
    this.http = http;
  }

  public getAutocompleteItem(addressInfo: AddressInfo): AddressInfoAutocompleteItem {
    return new AddressInfoAutocompleteItem(addressInfo);
  }

  public search(searchTerm: string): Observable<AddressInfoAutocompleteItem[]> {
    return this.http.get(WebServiceURLs.getAddressByTextUrl(searchTerm))
      .map(res => {
        const addresses = this.getAddress(res.json());
        if (addresses) {
          const searchResult = addresses.map((address) => {
            return this.getAutocompleteItem(address);
          });
          return searchResult;
        } else {
          return [];
        }
      })
      .catch(err => {
        return Observable.of([]);
      });
  }

  public getAddressSuggestion(address: any): AddressInfoAutocompleteItem {
    const item = new AddressInfoAutocompleteItem();
    item.City = address.city;
    item.Country = address.country;
    item.PostalCode = address.postalCode;
    item.StateProvince = address.province;
    item.AddressLine1 = address.streetAddress;
    return item;
  }

  private getAddress(addressResult: any): any {
    if (addressResult && addressResult.rows && addressResult.rows.row) {
      const addresses = addressResult.rows.row;
      if (addresses instanceof Array) {
        return addresses;
      } else if (addresses && addresses.AddressLine1 && addresses.City && addresses.StateProvince && addresses.PostalCode && addresses.Country) {
        return [addresses];
      }
    }
    return;
  }
}
