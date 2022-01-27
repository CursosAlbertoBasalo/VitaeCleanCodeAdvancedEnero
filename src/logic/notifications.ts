/* eslint-disable no-magic-numbers */
/* eslint-disable max-lines-per-function */
import { Booking, BookingStatus } from "../models/booking";
import { Email } from "../models/email";
import { Payment } from "../models/payment";
import { Traveler } from "../models/traveler";
import { HTTP } from "../tools/http";
import { SMTP } from "../tools/smtp";
import { Emails } from "./emails";

export class Notifications {
  private config = "http";
  private emailUrl = "https://mailmonk.com/v1/send";
  private smtpServer = "smtp.astrobookings.com";
  private smtpPort = 25;
  private smtpUser = "Traveler assistant";
  private smtpPassword = "astrobookings";
  private emails: Emails;

  public smtpSender = new SMTP(this.smtpServer, this.smtpPort, this.smtpUser, this.smtpPassword);

  constructor(private traveler: Traveler, private booking: Booking, private payment: Payment) {
    this.emails = new Emails(traveler, booking, payment);
  }

  public send(): void {
    const body = this.buildBody();
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
    const email = new Email(this.traveler.email, subject, body);
    if (this.config === "http") {
      this.sendEmailByHttp(email);
    } else {
      this.sendEmailBySmtp(email);
    }
  }

  private buildBody() {
    return this.emails.getBody();
  }

  private sendEmailByHttp(email: Email): unknown {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: email,
    };

    return HTTP.request(this.emailUrl, options);
  }
  private sendEmailBySmtp(email: Email): unknown {
    return this.smtpSender.sendMail(`"AstroBookings" <${this.smtpUser}>`, email.recipient, email.subject, email.body);
  }
}
