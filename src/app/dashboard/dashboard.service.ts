import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { WebServiceURLs } from '../shared/webServiceURLs';

@Injectable()
export class DashboardService {

  constructor(private http: Http) { }

  public getAnalytics(): Promise<any> {
    return this.http.get(WebServiceURLs.analytics)
      .toPromise()
      .then(response => {
        return response.json();
      });
  }

  public getLatestQuotes(): Promise<any> {
    return this.http.get(WebServiceURLs.latestQuotes)
      .toPromise()
      .then(response => {
        return response.json();
      });
  }
}
