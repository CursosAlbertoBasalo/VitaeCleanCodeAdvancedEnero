import { Booking } from "../models/booking";
import { Payment } from "../models/payment";
import { Traveler } from "../models/traveler";
import { IEmailSend } from "../tools/emailSend.interface";
import { EmailBuilder } from "./email.builder";
export class Notifications {
  constructor(private emailSender: IEmailSend) {}

  // 🧼 ✅
  // 3.1.2
  // Builder
  // Creates and call a class method that builds the email object
  // 🧼 ✅
  public send(booking: Booking, traveler: Traveler, payment: Payment): void {
    const email = new EmailBuilder(booking, traveler, payment).build();
    this.emailSender.sendMail(email);
  }
}
