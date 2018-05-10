export class OfferingAndLobCodes {
  public offeringCode: string;
  public lobCodes: string[];

  constructor(copy?: OfferingAndLobCodes) {
    if (copy) {
      this.offeringCode = copy.offeringCode;
      this.lobCodes = copy.lobCodes;
    } else {
      this.offeringCode = '';
      this.lobCodes = [];
    }
  }
}
