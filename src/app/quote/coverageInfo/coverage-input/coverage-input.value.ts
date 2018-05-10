export class CoverageInputValue {
  // Value from user input could be number but can be string when saved and recalled to backend.
  public limit: any;
  public deductible1: any;
  public deductible2: any;
  public selected: boolean;

  public isEqual(another: CoverageInputValue): boolean {
    return this.limit === another.limit &&
    this.deductible1 === another.deductible1 &&
    this.deductible2 === another.deductible2 &&
    this.selected === another.selected;
  }
}
