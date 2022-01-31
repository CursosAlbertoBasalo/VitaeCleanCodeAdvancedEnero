import { Email } from "../models/email";

export interface IEmailSend {
  sendMail(email: Email): string;
}
