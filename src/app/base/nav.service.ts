import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { GlobalObjectWrapperService } from '../shared';
import { BaseComponent } from './base.component';

export class UrlBreakdown {
  public paths: string[];
  public params: Map<string, string>;
}

@Injectable()
export class NavService extends BaseComponent {

  public readonly events: Observable<any>;
  private observer: any;
  private urlBreakdown: UrlBreakdown;

  constructor(
    private router: Router,
    private globalObjectWrapperService: GlobalObjectWrapperService
  ) {
    super();
    this.events = new Observable(this.eventNotifier.bind(this));
    this.safeSubscribe(router.events).subscribe(value => {
      if (value instanceof NavigationEnd) {
        delete this.urlBreakdown;
        this.urlBreakdown = this.breakdownUrls(this.router.url);
        if (this.observer && this.observer.next) {
          this.observer.next();
        }
      }
    });
  }

  public reload() {
    const nativeWindow = this.globalObjectWrapperService.nativeWindow;
    if (nativeWindow) {
      nativeWindow.location.reload();
    }
  }

  public isDashboard() {
    return this.urlBreakdown.paths[0] === 'dashboard';
  }

  public quoteSearch() {
    return this.urlBreakdown.paths[0] === 'quoteSearch';
  }

  public isReport() {
    return this.urlBreakdown.paths[0] === 'report';
  }

  public isQuote() {
    return this.urlBreakdown.paths.length === 1 &&
      this.urlBreakdown.paths[0] === 'quote';
  }

  public isQuoteNum() {
    return this.urlBreakdown.paths.length === 2 &&
      this.urlBreakdown.paths[0] === 'quote' &&
      this.urlBreakdown.paths[1];
  }

  public isQuoteNumCopy() {
    return this.urlBreakdown.paths.length === 3 &&
      this.urlBreakdown.paths[0] === 'quote' &&
      this.urlBreakdown.paths[1] &&
      this.urlBreakdown.paths[2] === 'copy';
  }

  public isSummaryNum() {
    return this.urlBreakdown.paths.length === 2 &&
      this.urlBreakdown.paths[0] === 'summary' &&
      this.urlBreakdown.paths[1];
  }

  // Todo: Broker-related logic must be disabled for Apr release 2018
  public isBroker() {
    return this.urlBreakdown.paths.length > 1 &&
      this.urlBreakdown.paths[0] === 'broker';
  }

  public isBrokerQuote() {
    return this.urlBreakdown.paths.length === 2 &&
      this.urlBreakdown.paths[0] === 'broker' &&
      this.urlBreakdown.paths[1] === 'businessInfo';
  }

  public isBrokerQuoteNum() {
    return this.urlBreakdown.paths.length === 3 &&
      this.urlBreakdown.paths[0] === 'broker' &&
      this.urlBreakdown.paths[1] === 'businessInfo' &&
      this.urlBreakdown.paths[2];
  }

  public isBrokerQuoteNumCopy() {
    return this.urlBreakdown.paths.length === 4 &&
      this.urlBreakdown.paths[0] === 'broker' &&
      this.urlBreakdown.paths[1] === 'businessInfo' &&
      this.urlBreakdown.paths[2] &&
      this.urlBreakdown.paths[3] === 'copy';
  }

  public isBrokerSummaryNum() {
    return this.urlBreakdown.paths.length === 3 &&
    this.urlBreakdown.paths[0] === 'broker' &&
      this.urlBreakdown.paths[1] === 'summary' &&
      this.urlBreakdown.paths[2];
  }

  private eventNotifier(observer) {
    this.observer = observer;
  }

  private breakdownUrls(url: string): UrlBreakdown {
    const breakdown = new UrlBreakdown();
    const pathParam = url.split('?');
    const paths = pathParam[0];
    const params = pathParam[1];

    if (!paths) {
      // something is wrong. just assume url is non breakable.
      breakdown.paths.push(url);
    } else {
      breakdown.paths = paths.split('/');
      // URL provided by router starts with /, so 0 position is always empty string.
      if (!breakdown.paths[0]) {
        breakdown.paths.shift();
      }

      if (params) {
        // set params
        breakdown.params = new Map();
        const paramList = params.split('&');
        paramList.forEach(param => {
          const kv = param.split('=');
          breakdown.params.set(kv[0], kv[1] || '');
        });
      }
    }
    return breakdown;
  }
}
