import { LobCoverage } from './LobCoverage.model';

export class CoverageGroup {
    public coverageGroupName: string;
    public coverageList: LobCoverage[] = [];
    public selectedCoverages: LobCoverage[] = [];
}
