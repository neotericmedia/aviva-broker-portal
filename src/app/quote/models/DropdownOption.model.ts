export class Option {
  public id: number;
  public Locale: Description;

  constructor(copy?: Option) {
    if (copy) {
      this.id = copy.id;
      this.Locale = new Description(copy.Locale);
    }
  }
}

class Description {
  public Description: string;

  constructor(copy?: Description) {
    this.Description = copy.Description;
  }
}
