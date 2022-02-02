import { MailMonkAdapter } from "../repository/mailMonk.adapter";
import { IEmailSend } from "./emailSend.interface";
import { SMTP } from "./smtp";

export class EmailSenderFactory {
  // 🧼 ✅
  // 3.1.1
  // Factory
  // Creates an instance based on configuration
  // Also with a cache (lightweight) and a singleton (same instance)
  // 🧼 ✅
  private static config = "http";
  private static emailSender: IEmailSend;
  public static getEmailSender(): IEmailSend {
    if (EmailSenderFactory.emailSender) {
      return EmailSenderFactory.emailSender;
    }
    if (EmailSenderFactory.config === "http") {
      EmailSenderFactory.emailSender = new MailMonkAdapter();
    } else {
      EmailSenderFactory.emailSender = new SMTP();
    }
    return EmailSenderFactory.emailSender;
  }
}
