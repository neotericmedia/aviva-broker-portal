import { Injectable } from '@angular/core';
import { BaseComponent } from '../../../base';
import { Http } from '@angular/http';
import { WebServiceURLs } from '../../../shared/webServiceURLs';
import { serialize } from 'serializer.ts/Serializer';

@Injectable()
export class LobQuestionsService extends BaseComponent {

  constructor(private http: Http) {
    super();
  }

  public saveLobQuestionAnswers(requestData: any, quoteNumber: string): Promise<any> {
    const url = WebServiceURLs.getSaveLobQuestionAnswersUrl(quoteNumber);
    return this.http.post(url, serialize(requestData))
      .toPromise()
      .then(response => {
        return {
          status: 'ok'
        };
      }).catch(e => {
        console.log('saveLobQuestionAnswers catch');
        return {
          status: 'fail',
          error: e.json()
        };
      });
  }
}
