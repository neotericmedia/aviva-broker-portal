/**
 * Model class to store Quote Version
 * History response from back-end server.
 */
export class QuoteTimelineResponse {
  // Quote status
  public status: string;
  // Quote modified date
  public modifiedDate: Date;
  // Quote created date
  public createdDate: Date;
  // User who modified the quote.
  public userName: string;
}
