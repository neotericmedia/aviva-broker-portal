import { LobAnswer } from './LobAnswer.model';
import { LobCoverage } from '../LobCoverage.model';
import { QuoteLOBCoverage } from '../QuoteLOBCoverage';

/**
 * Model class for saving coverage info to the server.
 */
export class CoverageInfoRequest {
  public loadDefault: boolean;
  public performRate: boolean;
  public coverageDetails: QuoteLOBCoverage[];
  public lobQuestionAnswers: LobAnswer[];
}
