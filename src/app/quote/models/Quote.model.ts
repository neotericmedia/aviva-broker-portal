import {
  BusinessInfo,
  BindInfo,
  Claim,
  QuoteBuildingInfo,
  QuoteLOBCoverage
} from '../models';

export class Quote {
  private _id: string;
  private status?: number;
  private statusValue?: string;
  private userName: string;
  private businessInfo: BusinessInfo;
  private claims?: Claim[];
  private OfferingCode: string;
  private lob: QuoteLOBCoverage[];
  private buildingInfo: QuoteBuildingInfo;
  private deviatedTotalPremium: number;
  private originalTotalPremimum: number;
  private deviation: number;
  private bindInfo: BindInfo;

  get getQuoteId(): string {
    return this._id;
  }

  get getBusinessInfo(): BusinessInfo {
    return this.businessInfo;
  }

  get getStatus(): number {
    return this.status;
  }

  get getUserName(): string {
    return this.userName;
  }

  get getOfferingCode(): string {
    return this.OfferingCode;
  }

  get getLob(): QuoteLOBCoverage[] {
    return this.lob;
  }

  get getBuildingInfo(): QuoteBuildingInfo {
    return this.buildingInfo;
  }

  get getClaims(): Claim[] {
    return this.claims;
  }

  get getDeviatedTotalPremium(): number {
    return this.deviatedTotalPremium;
  }

  get getOriginalTotalPremimum(): number {
    return this.originalTotalPremimum;
  }

  get getDeviation(): number {
    return this.deviation;
  }

  get getStatusValue(): string {
    return this.statusValue;
  }

  get getBindInfo(): BindInfo {
    return this.bindInfo;
  }
}
