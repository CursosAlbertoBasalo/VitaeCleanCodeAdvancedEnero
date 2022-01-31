import { Booking } from "../models/booking";
import { DB } from "../tools/bd";

export class BookingsData {
  public static selectById(bookingId: string): Booking {
    return DB.select<Booking>(`SELECT * FROM bookings WHERE id = '${bookingId}'`);
  }
  public static insert(booking: Booking): string {
    booking.id = DB.insert<Booking>(booking);
    return booking.id;
  }
  public static update(booking: Booking): number {
    return DB.update(booking);
  }
}
