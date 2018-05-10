import { LobCoverage } from './LobCoverage.model';
import { LOB } from './Lob.model';

// Match with backend model of offering lob coverage
export class OfferingLOBCoverage {
  public OfferingCode: string;
  public LOBCode: string;
  public LOB: LOB;
  public LegalSystem: string;
  public CoverageList: LobCoverage[];
}
