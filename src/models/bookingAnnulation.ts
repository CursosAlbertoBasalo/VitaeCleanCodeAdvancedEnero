export class BookingAnnulation {
  public travelerId: string;
  public bookingId: string;
  constructor(travelerId: string, bookingId: string) {
    this.travelerId = travelerId;
    this.bookingId = bookingId;
  }
}
