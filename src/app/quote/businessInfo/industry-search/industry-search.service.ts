// todo: cleanup imports
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { IndustryInfo, IndustryInfoAutocompleteItem } from './industry-search.model';
import { IndustryCodeCondition } from '../../../quote/models/IndustryCodeCondition.model';
import { deserialize } from 'serializer.ts/Serializer';
import { WebServiceURLs } from '../../../shared/webServiceURLs';

// TODO: Add base search service that handles timeout and debounce.
@Injectable()
export class IndustrySearchService {

  constructor(private http: Http) {
    this.http = http;
  }

  public getAutocompleteItem(industryInfo: IndustryInfo): IndustryInfoAutocompleteItem {
    if (industryInfo) {
      return new IndustryInfoAutocompleteItem(industryInfo);
    }
  }

  /**
   * Function to retrieve IndustryCode conditions for a specific industry code
   */
  public retrieveIndustryCodeCondition(industryCode: string) {
    let url: string = WebServiceURLs.getIndustryCodeConditions;
    if (industryCode) {
      url += industryCode;
    }

    return this.http.get(url)
      .toPromise()
      .then(response => {
        return deserialize<IndustryCodeCondition[]>(IndustryCodeCondition, response.json());
      });
  }
  /**
   * Function for industry code search(Descrption or Industry code(Numbers))
   */
  public search(searchTerm: string): Observable<IndustryInfoAutocompleteItem[]> {
    return this.http.get(WebServiceURLs.getIndustryByTextUrl(searchTerm))
      .map(res => {
        const result = res.json();
        if (result && result.length) {
          return result.map(industry => {
            return this.getAutocompleteItem(industry);
          });
        } else {
          return [];
        }
      })
      .catch(err => {
        return Observable.of([]);
      });
  }

  /**
   * Function for industry code search(Keyword search)
   * Example: Gardening Industry has keywords(Garden, Plants)
   */
  public searchByKeyword(searchTerm: string): Observable<IndustryInfoAutocompleteItem[]> {
    return this.http.get(WebServiceURLs.getIndustryByKeywordSearchUrl(searchTerm))
      .map(res => {
        const result = res.json();
        if (result) {
          return result;
        } else {
          return [];
        }
      })
      .catch(err => {
        return Observable.of([]);
      });
  }

  public searchByCode(code: string): Observable<IndustryInfoAutocompleteItem> {
    return this.http.get(WebServiceURLs.getIndustryByCodeUrl(code))
      .map(res => {
        const industryInfo = deserialize<IndustryInfo>(IndustryInfo, res.json());
        if (industryInfo) {
          return this.getAutocompleteItem(industryInfo);
        } else {
          return;
        }
      })
      .catch(err => {
        console.log('Failed to find industry info from industry code.');
        return Observable.of({} as IndustryInfoAutocompleteItem);
      });
  }
}
