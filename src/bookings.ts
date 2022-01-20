import { Booking } from "./booking";

export class Bookings {
  public solicite(booking: Booking): Booking {
    console.log(booking);
    return undefined;
  }
  public annulate(bookingId: string) {
    console.log(bookingId);
    return undefined;
  }
}
