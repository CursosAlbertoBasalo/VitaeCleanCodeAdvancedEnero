/* eslint-disable no-unused-vars */
import { Booking } from "./booking";
import { Payment } from "./payment";
import { Traveler } from "./traveler";

export class Emails {
  private newLine = "\n";

  public constructor(private traveler: Traveler, private booking: Booking, private payment: Payment) {}

  public getSalutation(): string {
    return "Dear " + this.traveler.name + "," + this.newLine;
  }
  public getMainBody(): string {
    return JSON.stringify(this.booking) + this.newLine + JSON.stringify(this.payment);
  }
  public getSignature(): string {
    return "Best regards," + this.newLine + "The Astro Bookings team";
  }
}
