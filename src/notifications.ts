import { Booking } from "./booking";
import { Traveler } from "./traveler";

export class Notifications {
  public send(traveler: Traveler, booking: Booking) {
    console.log(traveler, booking);
    return undefined;
  }
}
