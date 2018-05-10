export class BrokerInfo {
  public _id: number;
  public Name: string = '';
  public Province: string = '';
  public Region: string = '';
  public Branch: string = '';

  constructor(copy?: BrokerInfo) {
    if (copy) {
      this._id = copy._id;
      this.Name = copy.Name;
      this.Branch = copy.Branch;
    }
  }
}

export class BrokerInfoAutocompleteItem extends BrokerInfo {
  public id: number;
  public title: string;

  constructor(copy?: BrokerInfo) {
    super(copy);
    if (copy) {
      this.id = this._id;
      this.title = this._id + ' - ' + this.Name + ', ' + this.Branch;
    }
  }
}
