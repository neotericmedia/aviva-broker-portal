// TODO: Sort or group all URLs by router or functionality or something
export class WebServiceURLs {
  /* tslint:disable:member-ordering */
  public static readonly baseURL = '/catalyst/catalystws/';

  public static readonly login = WebServiceURLs.baseURL + 'login';
  public static readonly logout = WebServiceURLs.baseURL + 'logout';

  public static readonly lookUpBusiness = WebServiceURLs.baseURL + 'dnbproviderlookup';
  public static readonly GDM = WebServiceURLs.baseURL + 'dnborderandinvestigations?DnB_DUNS_Number=';
  public static readonly offeringLOBs = WebServiceURLs.baseURL + 'offeringlobindustry?IndustryCode=';
  public static readonly claimFieldControls = WebServiceURLs.baseURL + 'formfieldcontrols/claims';
  public static readonly provinceFieldControls = WebServiceURLs.baseURL + 'formfieldcontrols/provinces';

  // Quote Info Router
  public static readonly saveBusinessInfo = WebServiceURLs.baseURL + 'businessinfo';
  public static getOfferingLobsAndCoverages(quoteNumber: string) {
    return `${WebServiceURLs.baseURL}offeringlobcoverage/${quoteNumber}?groupBy=LOBCode`;
  }
  public static readonly loadCoveragesWithZones = WebServiceURLs.baseURL + 'zones';
  public static readonly iclarify = WebServiceURLs.baseURL + 'iclarify';
  public static getFindByQuoteNumberUrl(quoteNumber: string) {
    return `${WebServiceURLs.baseURL}quoteinfo/quote/${quoteNumber}`;
  }
  public static getQuotesByDates(from: string, to: string) {
    return `${WebServiceURLs.baseURL}quoteinfo/searchByDate?from=${from}&to=${to}`;
  }
  public static readonly statusMap = WebServiceURLs.baseURL + 'quoteinfo/statusMap';
  public static getAddressByTextUrl(term: string) {
    return `${WebServiceURLs.baseURL}autocompleteloqate?AddressLine1=${term}`;
  }

  // Report Page Router
  public static readonly reportTypes = WebServiceURLs.baseURL + 'formfieldcontrols/reportTypes';
  public static getTimeline(quoteNumber: string): string {
    return WebServiceURLs.baseURL.concat('report/byQuoteNumber/').concat(quoteNumber);
  }
  public static getTimelineInCSV(quoteNumber: string): string {
    return `${WebServiceURLs.baseURL}report/byQuoteNumber/${quoteNumber}/csv`;
  }
  public static getReport(from: string, to: string, type: number): string {
    return `${WebServiceURLs.baseURL}report/getReport?from=${from}&to=${to}&type=${type}`;
  }

  // Business Info Router
  public static readonly findAllVersionsOfQuoteNumber = WebServiceURLs.baseURL + 'businessinfo/quote/allversions/';

  // Coverage Info Router
  public static getSaveCoverageInfoUrl(quoteNumber: string) {
    return `${WebServiceURLs.baseURL}coverageinfo/${quoteNumber}`;
  }
  public static readonly retrieveQuote = WebServiceURLs.baseURL + 'coverageinfo/quote/';
  public static readonly getIndustryCodeConditions = WebServiceURLs.baseURL + 'industrycodecondition/';
  public static readonly sendPdf = WebServiceURLs.baseURL + 'quotedoc/sendpdf';

  public static getBrokerByTextUrl(term: string) {
    return `${WebServiceURLs.baseURL}broker/autocomplete/${term}`;
  }

  public static getLobQuestionsUrl(lobCodes?: string[]): string {
    let query = '';
    if (lobCodes && lobCodes.length) {
      query = '?' + lobCodes.map((code) => {
        return 'LOBCode=' + code;
      }).join('&');
    }
    return `${WebServiceURLs.baseURL}lobquestions${query}`;
  }

  public static getSaveLobQuestionAnswersUrl(quoteNumber: string) {
    return `${WebServiceURLs.baseURL}lobquestionanswers/${quoteNumber}`;
  }

  public static getIndustryByTextUrl(term: string) {
    return `${WebServiceURLs.baseURL}industrycodes/description/${term}`;
  }

  public static getIndustryByCodeUrl(code: string) {
    return `${WebServiceURLs.baseURL}industrycodes/code/${code}`;
  }

  public static getIndustryByKeywordSearchUrl(term: string) {
    return `${WebServiceURLs.baseURL}industrycodes/keyword/${term}`;
  }

  public static readonly quoteDeviation = WebServiceURLs.baseURL + 'quoteinfo/deviation/';

  public static readonly analytics = WebServiceURLs.baseURL + 'analytics/';
  public static readonly latestQuotes = WebServiceURLs.baseURL + 'analytics/quotes/byUser/';

  public static readonly loginStatus = WebServiceURLs.baseURL + 'login/status';

  public static readonly bindTypesControls = WebServiceURLs.baseURL + 'formfieldcontrols/bindTypes';
  public static getSaveBindInfoUrl(quoteNum: string): string {
    return WebServiceURLs.baseURL.concat('bind/save/').concat(quoteNum);
  }
  public static getBindInfoUrl(quoteNum: string): string {
    return WebServiceURLs.baseURL.concat('bind/').concat(quoteNum);
  }
  public static getUnbindInfoUrl(quoteNum: string): string {
    return WebServiceURLs.baseURL.concat('bind/unbind/').concat(quoteNum);
  }
}
