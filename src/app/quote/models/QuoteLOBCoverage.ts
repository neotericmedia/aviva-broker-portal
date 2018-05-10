import { LobCoverage } from './LobCoverage.model';

export class QuoteLOBCoverage {
  public LOBCode: string;
  public LegalSystem?: string;
  public LOBDescription: string;
  public coverageList: LobCoverage[];
}
