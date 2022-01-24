/* eslint-disable max-lines-per-function */
import { Booking, BookingStatus } from "../models/booking";
import { Payment } from "../models/payment";
import { Traveler } from "../models/traveler";
import { HTTP } from "../tools/http";
import { SMTP } from "../tools/smtp";
import { EmailComposer } from "./email_composer";

export class Notifications {
  private config = "http";
  public emailComposer: EmailComposer;

  constructor(private traveler: Traveler, private booking: Booking, private payment: Payment) {
    this.emailComposer = new EmailComposer(traveler, booking, payment);
  }

  public send(body: string): void {
    let subject = "";
    switch (this.booking.status) {
      case BookingStatus.RESERVED:
        subject = `Booking ${this.booking.id} reserved for ${this.booking.passengersCount} passengers`;
        break;
      case BookingStatus.RELEASED:
        subject = `Booking ${this.booking.id} released for ${this.booking.passengersCount} passengers`;
        break;
      case BookingStatus.CANCELLED:
        subject = `Trip corresponding to booking ${this.booking.id} was cancelled `;
        break;
    }
    if (this.config === "http") {
      this.sendEmailByHttp(this.traveler.email, subject, body);
    } else {
      this.sendEmailBySmtp(this.traveler.email, subject, body);
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
