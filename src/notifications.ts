/* eslint-disable max-lines-per-function */
import { Booking, BookingStatus } from "./booking";
import { HTTP } from "./http";
import { Payment } from "./payment";
import { Traveler } from "./traveler";

export class Notifications {
  private emailUrl = "https://mailmonk.com/v1/send";

  public send(traveler: Traveler, booking: Booking, payment: Payment): void {
    const emailComposer = new EmailComposer(traveler, booking, payment);
    let subject = "";
    switch (booking.status) {
      case BookingStatus.RESERVED:
        subject = `Booking ${booking.id} reserved for ${booking.passengersCount} passengers`;
        break;
      case BookingStatus.RELEASED:
        subject = `Booking ${booking.id} released for ${booking.passengersCount} passengers`;
        break;
      case BookingStatus.CANCELLED:
        subject = `Trip corresponding to booking ${booking.id} was cancelled `;
        break;
    }
    const body = emailComposer.getSalutation() + emailComposer.getMainBody() + emailComposer.getSignature();
    this.sendEmail(traveler.email, subject, body);
  }

  private sendEmail(recipient: string, subject: string, body: string): unknown {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        recipient,
        subject,
        body,
      },
    };
    return HTTP.request(this.emailUrl, options);
  }
}

class EmailComposer {
  private newLine = "\n";

  public constructor(private traveler: Traveler, private booking: Booking, private payment: Payment) {}

  public getSalutation(): string {
    switch (this.booking.status) {
      case BookingStatus.RESERVED:
        return (
          "Dear " +
          this.traveler.name +
          this.newLine +
          "we are happy to confirm you that your trip booking was reserved" +
          this.newLine
        );
      case BookingStatus.RELEASED:
        return (
          "Dear " +
          this.booking.travelerId +
          this.newLine +
          "as yous have requested, your trip booking was annulled" +
          this.newLine
        );
      case BookingStatus.CANCELLED:
        return (
          "Dear " +
          this.booking.travelerId +
          this.newLine +
          "we are sorry to inform you that your trip was cancelled" +
          this.newLine
        );
    }
  }
  public getMainBody(): string {
    return JSON.stringify(this.booking) + this.newLine + JSON.stringify(this.payment);
  }
  public getSignature(): string {
    return "Best regards," + this.newLine + "The Astro Bookings team";
  }
}
