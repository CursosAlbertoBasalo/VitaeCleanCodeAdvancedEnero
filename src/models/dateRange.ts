export class DateRange {
  private static millisecondsPerDay = 1000 * 60 * 60 * 24;
  constructor(public readonly start: Date, public readonly end: Date) {
    if (start > end) {
      throw new Error("Start date must be before end date");
    }
  }
  public getMilliseconds(): number {
    return this.end.getTime() - this.start.getTime();
  }
  public getNights(): number {
    return Math.round(this.getMilliseconds() / DateRange.millisecondsPerDay);
  }
}
