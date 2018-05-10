import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { WebServiceURLs } from '../../shared/webServiceURLs';

@Injectable()
export class QuoteService {
  constructor(private http: Http) {}

  public async getStatusMap(): Promise<any> {
    const url = WebServiceURLs.statusMap;
    const res = this.http.get(url).map(response => {
        return response.json();
    }).toPromise();
    return res;
  }
}
