import { Type, Skip } from 'serializer.ts/Decorators';

export class AddressInfo {
  public ProcessedBy: string = '';
  public HouseNumber: string = '';
  public AddressLine1: string = '';
  public AddressLine2: string = '';
  public AddressLine3: string = '';
  public AddressLine4: string = '';
  public FirmName: string = '';
  public City: string = '';
  public StateProvince: string = '';
  public PostalCode: string = '';
  public Country: string = '';
  public ApartmentLabel: string = '';
  public ApartmentLabel2: string = '';
  // tslint:disable-next-line:variable-name
  public user_fields: string = '';

  constructor(copy?: AddressInfo) {
    if (copy) {
      this.ProcessedBy = copy.ProcessedBy;
      this.HouseNumber = copy.HouseNumber;
      this.AddressLine1 = copy.AddressLine1;
      this.AddressLine2 = copy.AddressLine2;
      this.AddressLine3 = copy.AddressLine3;
      this.AddressLine4 = copy.AddressLine4;
      this.FirmName = copy.FirmName;
      this.City = copy.City;
      this.StateProvince = copy.StateProvince;
      this.PostalCode = copy.PostalCode;
      this.Country = copy.Country;
      this.ApartmentLabel = copy.ApartmentLabel;
      this.ApartmentLabel2 = copy.ApartmentLabel2;
      this.user_fields = copy.user_fields;
    }
  }
}

export class AddressInfoAutocompleteItem extends AddressInfo {
  public title: string = '';

  constructor(copy?: AddressInfo) {
    super(copy);
    if (copy) {
      this.title = this.AddressLine1 + ', ' + this.City + ', ' + this.StateProvince + ', ' + this.PostalCode + ', ' + this.Country;
    }
  }
}
