import { Injectable } from '@angular/core';
import { Http, ResponseContentType, RequestOptions } from '@angular/http';
import { deserialize } from 'serializer.ts/Serializer';
import { WebServiceURLs } from '../shared/webServiceURLs';
import { Option } from '../quote/models';

@Injectable()
export class ReportService {
  constructor(private http: Http) { }

  public getTimelineInCSV(quoteNumber: string): Promise<any> {
    const url = WebServiceURLs.getTimelineInCSV(quoteNumber);
    return this.call(url);
  }

  public getReport(from: string, to: string, type: number): Promise<any> {
    const url = WebServiceURLs.getReport(from, to, type);
    return this.call(url);
  }

  public getReportTypes(): Promise<Option[]> {
    let url = WebServiceURLs.reportTypes;
    return this.http.get(url)
      .toPromise()
      .then(response => deserialize<Option[]>(Option, response.json()));
  }

  private call(url: string): Promise<any> {
    const requestOptions = new RequestOptions({
      responseType: ResponseContentType.Blob
    });
    const res = this.http.get(url, requestOptions).map(resp => {
      return {
        // Todo: file name should be generated at UI side instead to save server process time.
        fileName: resp.headers.get('content-disposition').split('filename=')[1],
        content: resp.json()
      };
    }).toPromise();
    return res;
  }
}
