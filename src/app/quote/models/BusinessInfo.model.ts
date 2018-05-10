import * as moment from 'moment';
import { Type } from 'serializer.ts/Decorators';
import {
  LobAnswer,
  Address,
  LegalName,
  GDM
} from '../models';

export class BusinessInfo {
  public annualPayrollCA: number;
  public annualPayrollFO: number;
  public annualPayrollUS: number;
  public annualRevenueCA: number;
  public annualRevenueFO: number;
  public annualRevenueUS: number;
  public brokerCode: string;
  public brokerContactName: string;
  public brokerContactEmail: string;
  public brokerName: string;
  public businessSetup: string;
  public displayBusinessName?: string;
  public effectiveDate: Date;
  public expiryDate: Date;
  public industryCode: string;
  public industryCodeDescription: string;
  public isMailingDifferent: boolean;
  public lobCodes: string[];
  public namedInsured: string;
  public numOfClaims: number;
  public offeringCode: string;
  public operatingName: string;
  public overClaimLimit: boolean;
  public premium: string;
  public quoteNumber: string;
  public ratingBasis: string;
  public relationToInsured: string;
  public wasPolicyCancelled: boolean;
  public yearsInRelevantBusiness: number;

  @Type(() => LobAnswer)
  public lobQuestionAnswers: LobAnswer[];

  @Type(() => LegalName)
  public legalNames: LegalName[];

  @Type(() => Address)
  public companyAddress: Address;

  @Type(() => Address)
  public mailingAddress: Address;

  @Type(() => GDM)
  public businessDetails: GDM;

  constructor(copy?: any) {
    if (copy) {
      this.annualPayrollCA = copy.annualPayrollCA;
      this.annualPayrollUS = copy.annualPayrollUS;
      this.annualPayrollFO = copy.annualPayrollFO;
      this.annualRevenueCA = copy.annualRevenueCA;
      this.annualRevenueUS = copy.annualRevenueUS;
      this.annualRevenueFO = copy.annualRevenueFO;
      this.brokerCode = copy.brokerCode;
      this.brokerContactName = copy.brokerContactName;
      this.brokerContactEmail = copy.brokerContactEmail;
      this.brokerName = copy.brokerName;
      this.businessDetails = new GDM();
      this.businessDetails.yearsInBusiness = copy.yearsInBusiness;
      this.businessDetails.numOfEmployees = copy.numOfEmployees;
      this.businessDetails.suitJudgementExists = copy.suitJudgementExists;
      this.businessDetails.financialStressScore = copy.financialStressScore;
      this.businessDetails.commercialCreditScore = copy.commercialCreditScore;
      this.businessSetup = copy.businessSetup;
      this.companyAddress = copy.companyAddress as Address;
      this.displayBusinessName = copy.displayBusinessName;
      this.effectiveDate = new Date(copy.effectiveDate);
      this.expiryDate = new Date(copy.expiryDate);
      this.industryCode = copy.industryCode;
      this.industryCodeDescription = copy.industryCodeDescription;
      this.isMailingDifferent = copy.isMailingDifferent;
      this.lobQuestionAnswers = copy.lobQuestionAnswers;
      this.legalNames = [new LegalName()];
      this.lobCodes = [];
      this.mailingAddress = copy.mailingAddress as Address;
      this.namedInsured = copy.namedInsured;
      this.numOfClaims = copy.numOfClaims;
      this.operatingName = copy.operatingName;
      this.overClaimLimit = copy.overClaimLimit;
      this.premium = copy.premium;
      this.quoteNumber = copy.quoteNumber;
      this.ratingBasis = copy.ratingBasis;
      this.relationToInsured = copy.relationToInsured;
      this.wasPolicyCancelled = copy.wasPolicyCancelled;
      this.yearsInRelevantBusiness = copy.yearsInRelevantBusiness;
    } else {
      this.annualPayrollUS = 0;
      this.annualPayrollFO = 0;
      this.annualRevenueUS = 0;
      this.annualRevenueFO = 0;
      this.brokerContactEmail = '';
      this.brokerContactName = '';
      this.businessDetails = new GDM();
      this.companyAddress = new Address();
      this.displayBusinessName = '';
      this.effectiveDate = new Date();
      this.expiryDate = moment(new Date()).add(1, 'year').toDate();
      this.isMailingDifferent = false;
      this.lobQuestionAnswers = [];
      this.legalNames = [new LegalName()];
      this.lobCodes = [];
      this.mailingAddress = new Address();
      this.namedInsured = '';
      this.numOfClaims = 0;
      this.operatingName = '';
      this.overClaimLimit = false;
      this.relationToInsured = '';
      this.wasPolicyCancelled = false;
    }
  }
}
