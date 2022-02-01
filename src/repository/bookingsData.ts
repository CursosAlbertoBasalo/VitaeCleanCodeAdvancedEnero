import { Booking } from "../models/booking";
import { DB } from "../tools/bd";

export class BookingsData {
  public static insert(booking: Booking): string {
    return DB.insert<Booking>(booking);
  }
}
