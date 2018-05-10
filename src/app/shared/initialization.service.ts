import { Injectable } from '@angular/core';

@Injectable()
export class InitializationService {
  private userLocale: string;
  private userLang: string = 'en';
  private username: string;
  private hasTimedOut: boolean;

  constructor() {
    let userLang = this.userLang;
    let userLocale;
    if (location.search) {
      const paramString = location.search.substring(1);
      const params = paramString.split('&');
      params.forEach(param => {
        if (param === 'lang=fr') {
          userLang = 'fr';
        }
        if (param.startsWith('locale=')) {
          const kv = param.split('=');
          userLocale = kv[1];
        }
      });
    }
    this.userLang = userLang;
    this.userLocale = userLocale;
  }

  public getUserLang() {
    return this.userLang;
  }

  public getUserLocale() {
    return this.userLocale;
  }

  public getUsername(): string {
    return this.username;
  }

  public hasBeenTimedOut(): boolean {
    return this.hasTimedOut;
  }

  public resetAuthentication(timedOut: boolean) {
    this.hasTimedOut = timedOut;
    delete this.username;
  }

  public setAuthentication(username: string) {
    this.hasTimedOut = false;
    this.username = username;
  }

  public isAuthenticated() {
    return !this.hasTimedOut && this.username;
  }
}
