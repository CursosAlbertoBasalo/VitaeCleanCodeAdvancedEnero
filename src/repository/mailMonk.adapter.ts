import { Email } from "../models/email";
import { IEmailSend } from "../tools/emailSend.interface";
import { HTTP } from "../tools/http";

export class MailMonkAdapter implements IEmailSend {
  private emailUrl = "https://mailmonk.com/v1/send";
  public sendMail(email: Email): string {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: email,
    };
    const response = HTTP.request(this.emailUrl, options);
    return response.status.toLocaleString();
  }
}
