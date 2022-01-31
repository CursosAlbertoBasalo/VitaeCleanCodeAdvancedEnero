import { Booking, BookingStatus } from "../models/booking";
import { Email } from "../models/email";
import { Payment } from "../models/payment";
import { Traveler } from "../models/traveler";
import { IEmailSend } from "../tools/emailSend.interface";
import { Emails } from "./emails";
export class Notifications {
  private emails: Emails;

  constructor(private emailSender: IEmailSend) {}

  // 🧼 ✅
  // 2.3.1
  // Dependency Inversion Principle
  // 🧼 ✅

  public send(traveler: Traveler, booking: Booking, payment: Payment): void {
    this.emails = new Emails(traveler, booking, payment);
    const body = this.emails.getBody();
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
    const email = new Email(traveler.email, subject, body);
    this.emailSender.sendMail(email);
  }
}
