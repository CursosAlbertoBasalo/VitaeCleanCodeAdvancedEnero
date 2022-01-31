import { Email } from "../models/email";
import { IEmailSend } from "./emailSend.interface";
const PORT = 25;
export class SMTP implements IEmailSend {
  private smtpServer = "smtp.astrobookings.com";
  private smtpPort = PORT;
  private smtpUser = "Traveler assistant";
  private smtpPassword = "astrobookings";
  private smtp: { host: string; port: number; user: string; pass: string };

  constructor() {
    this.smtp = {
      host: this.smtpServer,
      port: this.smtpPort,
      user: this.smtpUser,
      pass: this.smtpPassword,
    };
  }
  public sendMail(email: Email): string {
    console.log(this.smtp);
    console.log(email);
    return "250 OK";
  }
}
