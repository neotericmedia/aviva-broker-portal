import { LobCoverage } from '../models/LobCoverage.model';

export class CoverageInfoUtils {
  public static getPseudoId(cvg: LobCoverage, index?: number) {
    let id;
    if (typeof cvg.id === 'number') {
      id = cvg.id;
    } else {
      id = index;
    }
    return `coverage-${id}`;
  }

  public static isTitle(cvg: LobCoverage) {
    return cvg.CoverageOptionality === 'T';
  }

  public static isOptionalityStandAlone(cvg: LobCoverage) {
    return cvg.CoverageOptionality === 'S';
  }

  public static isOptionalityMandatory(cvg: LobCoverage) {
    return cvg.CoverageOptionality === 'M';
  }

  public static isOptionalityOptional(cvg: LobCoverage) {
    return cvg.CoverageOptionality === 'O';
  }

  public static isMandatory(cvg: LobCoverage) {
    return cvg.Existence === 'M';
  }

  public static isRecommended(cvg: LobCoverage) {
    return cvg.Existence === 'R';
  }

  public static isNotAvailable(cvg: LobCoverage) {
    return cvg.Existence === 'N';
  }

  public static isCgl00RateCode(cvg: LobCoverage) {
    return cvg.CoverageRateCode === 'CGL-00';
  }

  public static hasDeductible(cvg: LobCoverage) {
    return !!cvg.Deductible1Enum && cvg.Deductible1Required === 'Y';
  }

  public static hasTwoDeductibles(cvg: LobCoverage) {
    return CoverageInfoUtils.hasDeductible(cvg)
      && cvg.Deductible2Required === 'Y' && !!cvg.Deductible2Enum;
  }

  public static isSupportedLimitType(cvg: LobCoverage) {
    return cvg.LimitType === 'DL' || cvg.LimitType === 'FF';
  }
}
