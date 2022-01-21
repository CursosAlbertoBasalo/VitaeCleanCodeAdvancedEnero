/* eslint-disable max-lines-per-function */
import { Booking, BookingStatus } from "./booking";
import { HTTP } from "./http";
import { Payment } from "./payment";
import { SMTP } from "./smtp";
import { Traveler } from "./traveler";

export class Notifications {
  private config = "http";

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
    if (this.config === "http") {
      this.sendEmailByHttp(traveler.email, subject, body);
    } else {
      this.sendEmailBySmtp(traveler.email, subject, body);
    }
  }

  private sendEmailByHttp(recipient: string, subject: string, body: string): unknown {
    const emailUrl = "https://mailmonk.com/v1/send";
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

    return HTTP.request(emailUrl, options);
  }
  private sendEmailBySmtp(recipient: string, subject: string, body: string): unknown {
    const smtpServer = "smtp.astrobookings.com";
    const smtpPort = 25;
    const smtpUser = "Traveler assistant";
    const smtpPassword = "astrobookings";
    return new SMTP(smtpServer, smtpPort, smtpUser, smtpPassword).sendMail(
      `"AstroBookings" <${smtpUser}>`,
      recipient,
      subject,
      body
    );
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
