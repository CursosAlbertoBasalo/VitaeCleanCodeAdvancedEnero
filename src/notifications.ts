import { Booking } from "./booking";
import { HTTP } from "./http";
import { Payment } from "./payment";
import { Traveler } from "./traveler";

export class Notifications {
  private emailUrl = "https://mailmonk.com/v1/send";

  public send(traveler: Traveler, booking: Booking, payment: Payment): void {
    const subject = `Booking ${booking.id} for ${booking.passengersCount} passengers`;
    const emailComposer = new EmailComposer(booking, payment);
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

  public constructor(private booking: Booking, private payment: Payment) {}

  public getSalutation(): string {
    return "Dear " + this.booking.travelerId + "," + this.newLine + this.newLine;
  }
  public getMainBody(): string {
    return JSON.stringify(this.booking) + this.newLine + JSON.stringify(this.payment);
  }
  public getSignature(): string {
    return "Best regards," + this.newLine + "The Astro Bookings team";
  }
}
