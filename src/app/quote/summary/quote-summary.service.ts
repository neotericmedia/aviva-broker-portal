import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { serialize, deserialize } from 'serializer.ts/Serializer';
import { WebServiceURLs } from '../../shared/webServiceURLs';
import {
  BusinessInfo,
  IndustryCodeCondition,
  Quote
} from '../models';

@Injectable()
export class QuoteSummaryService {

  constructor(private http: Http) { }

  /**
   * Function to retrieve Quote for a specific Quote Number
   */
  public retrieveQuote(quoteNumber: string) {
    const url: string = WebServiceURLs.getFindByQuoteNumberUrl(quoteNumber);

    return this.http.get(url)
      .toPromise()
      .then(response => deserialize<Quote>(Quote, response.json()));
  }

  /**
   * Function that calls back-end to send PDF
   */
  public sendPdf(quoteNumber: string, subject: string, sender: string, textBody: string, recipients: string[], ccRecipients?: string[]): Promise<any> {
    let url: string = WebServiceURLs.sendPdf;

    return this.http.post(url, serialize({
      quoteNumber,
      subject,
      sender,
      textBody,
      recipients,
      ccRecipients
    }))
    .toPromise()
    .then(response => {
      console.log('send pdf response', response);
      return {
        status: 'ok'
      };
    });
  }
}
