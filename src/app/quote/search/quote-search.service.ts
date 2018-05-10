import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { deserialize } from 'serializer.ts/Serializer';
import { Quote } from '../models/Quote.model';
import { QuoteTimelineResponse } from '../models/QuoteTimelineResponse.model';
import { WebServiceURLs } from '../../shared/webServiceURLs';

@Injectable()
export class QuoteSearchService {

    public quoteSearch: Quote[];

    constructor(private http: Http) { }

    public async getQuotesByDates(from: string, to: string): Promise<any> {
        const url = WebServiceURLs.getQuotesByDates(from, to);
        const res = this.http.get(url).map(response => {
            return response.json();
        }).toPromise();
        return res;
    }

    public async findByQuoteNumber(quoteNumber: string): Promise<Quote> {
        const url = WebServiceURLs.getFindByQuoteNumberUrl(quoteNumber);
        const res = this.http.get(url).map(response => {
            return deserialize<Quote>(Quote, response.json());
        }).toPromise().catch((err) => {
            throw err.json();
        });
        return res;
    }

    /**
     * Function to retrieve quote version history for the sidebar timeline view.
     */
    public async getQuoteTimelineByQuoteNum(quoteNumber: string): Promise<QuoteTimelineResponse[]> {
        const url = WebServiceURLs.getTimeline(quoteNumber);
        const res = this.http.get(url).map(response => {
            return deserialize<QuoteTimelineResponse[]>(QuoteTimelineResponse, response.json());
        }).toPromise();
        return res;
    }
}
