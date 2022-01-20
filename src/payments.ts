import { Booking } from "./booking";
import { Payment } from "./payment";

export class Payments {
  public payBooking(booking: Booking): Payment {
    console.log(booking);
    return undefined;
  }
  public refundBooking(booking: Booking): Payment {
    console.log(booking);
    return undefined;
  }
}
