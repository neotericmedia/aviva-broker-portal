import { Skip } from 'serializer.ts/Decorators';

export class BuildingDetails {
  @Skip()
  private valid: boolean = false;

  private yearBuilt: number;
  private numberOfStories: number;
  private construction: string;
  private occupancyOfBuilding: string;
  private typeOfBurglaryProtection: string;

  private fusTerritoryGrade: number;
  private fusTownGrade: number;

  public getValid(): boolean {
    return this.valid;
  }
  public setValid(valid: boolean) {
    this.valid = valid;
  }

  public getYearBuilt(): number {
    return this.yearBuilt;
  }
  public setYearBuilt(yearBuilt: number) {
    this.yearBuilt = yearBuilt;
  }
  public getNumberOfStories(): number {
    return this.numberOfStories;
  }
  public setNumberOfStories(numberOfStories: number) {
    this.numberOfStories = numberOfStories;
  }
  public getConstruction(): string {
    return this.construction;
  }
  public setConstruction(construction: string) {
    this.construction = construction;
  }
  public getOccupancyOfBuilding(): string {
    return this.occupancyOfBuilding;
  }
  public setOccupancyOfBuilding(occupancyOfBuilding: string) {
    this.occupancyOfBuilding = occupancyOfBuilding;
  }
  public getTypeOfBurglaryProtection(): string {
    return this.typeOfBurglaryProtection;
  }
  public setTypeOfBurglaryProtection(typeOfBurglaryProtection: string) {
    this.typeOfBurglaryProtection = typeOfBurglaryProtection;
  }
  public getFusTerritoryGrade(): number {
    return this.fusTerritoryGrade;
  }
  public setFusTerritoryGrade(fusTerritoryGrade: number) {
    this.fusTerritoryGrade = fusTerritoryGrade;
  }
  public getFusTownGrade(): number {
    return this.fusTownGrade;
  }
  public setFusTownGrade(fusTownGrade: number) {
    this.fusTownGrade = fusTownGrade;
  }
}
