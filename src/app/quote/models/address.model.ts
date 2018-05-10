export class Address {
  public streetAddress: string;
  public city: string;
  public province: string;
  public country: string;
  public postalCode: string;

  public isEmpty(): boolean {
    return !!!(this.streetAddress || this.city || this.province || this.country || this.postalCode);
  }

  public reset() {
    this.streetAddress = '';
    this.city = '';
    this.province = '';
    this.country = '';
    this.postalCode = '';
  }
}
