export class PremiumDetails {
  public effectiveDate;
  public expiryDate;
  public quoteNumber;
  public deviation;
  public deviatedPremium;

  constructor(
    effectiveDate: Date,
    expiryDate: Date,
    quoteNumber: string,
    deviation: number,
    deviatedPremium: number
  ) {
    this.effectiveDate = effectiveDate;
    this.expiryDate = expiryDate;
    this.quoteNumber = quoteNumber;
    this.deviation = deviation;
    this.deviatedPremium = deviatedPremium;
  }
}
