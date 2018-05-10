import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable, Subject } from 'rxjs';
import { WebServiceURLs } from '../shared/webServiceURLs';
import { BaseComponent } from '../base';
import { NavService } from '../base/nav.service';

@Injectable()
export class HeaderService extends BaseComponent {
  public path: string;
  public highlightName: string;
  private newQuoteSource = new Subject();

  constructor(
    private http: Http,
    private navService: NavService
  ) {
    super();
    this.safeSubscribe(this.navService.events).subscribe(() => {
      if (this.navService.isDashboard()) {
        this.highlightName = 'dashboard';
      } else if (this.navService.quoteSearch()) {
        this.highlightName = 'allquotes';
      } else if (this.navService.isReport()) {
        this.highlightName = 'report';
      } else if (
        this.navService.isQuote() ||
        this.navService.isQuoteNumCopy() ||
        this.navService.isBrokerQuote() ||
        this.navService.isBrokerQuoteNumCopy()
      ) {
        this.highlightName = 'newquote';
      } else {
        this.highlightName = '';
      }
    });
  }

  public getNewQuoteObservable(): Observable<any> {
    return this.newQuoteSource.asObservable();
  }

  public notifyNewQuoteClicked() {
    this.newQuoteSource.next();
  }

  public logout() {
    return this.http.get(WebServiceURLs.logout).toPromise();
  }
}
