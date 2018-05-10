export class InfoCard {
  public firstTitle;
  public firstContent;
  public secondTitle;
  public secondContent;
  public thirdTitle;
  public thirdContent;
  public header;

  constructor(
    firstTitle: string,
    firstContent: string,
    secondTitle: string,
    secondContent: string,
    thirdTitle: string,
    thirdContent: string,
    header?: string
  ) {
    this.firstTitle = firstTitle;
    this.firstContent = firstContent;
    this.secondTitle = secondTitle;
    this.secondContent = secondContent;
    this.thirdTitle = thirdTitle;
    this.thirdContent = thirdContent;
    this.header = header;
  }
}
