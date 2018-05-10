export class IndustryInfo {
  public _id: string;
  public IndustryCode: string = '';
  public SegmentCode: string = '';
  public Locale: LocaleDescription;
  public LiabGradeCanada: string = '';
  public PropOccupancyGrade: string = '';
  public RatingBasis: string = '';
  public IsALSPreferred: string = '';

  constructor(copy?: IndustryInfo) {
    if (copy) {
      this._id = copy._id;
      this.IndustryCode = copy.IndustryCode;
      this.SegmentCode = copy.SegmentCode;
      this.Locale = new LocaleDescription();
      this.Locale.Description = copy.Locale.Description;
      this.LiabGradeCanada = copy.LiabGradeCanada;
      this.PropOccupancyGrade = copy.PropOccupancyGrade;
      this.RatingBasis = copy.RatingBasis;
      this.IsALSPreferred = copy.IsALSPreferred;
    }
  }
}

class LocaleDescription {
  public Description: string = '';
}

export class IndustryInfoAutocompleteItem extends IndustryInfo {
  public id: string;
  public title: string;

  constructor(copy?: IndustryInfo) {
    super(copy);
    if (copy) {
      this._id = this.id;
      this.title = this.IndustryCode + ' - ' + this.Locale.Description;
    }
  }
}
