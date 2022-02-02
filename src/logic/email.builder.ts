import { Booking, BookingStatus } from "../models/booking";
import { Email } from "../models/email";
import { Payment } from "../models/payment";
import { Traveler } from "../models/traveler";

export class EmailBuilder {
  private newLine = "\n";

  // 🧼 ✅
  // 3.1.2
  // Builder
  // Creates a complex email object
  // Could be implemented with simple static methods
  // 🧼 ✅

  public constructor(private booking: Booking, private traveler: Traveler, private payment: Payment) {}

  public build(): Email {
    const recipient = this.traveler.email;
    const subject = this.getSubject();
    const body = this.getBody();
    return new Email(recipient, subject, body);
  }

  private getSubject(): string {
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
    return subject;
  }
  private getBody() {
    return this.getSalutation() + this.getMainBody() + this.getSignature();
  }
  private getSalutation(): string {
    switch (this.booking.status) {
      case BookingStatus.RESERVED:
        return `Dear ${this.traveler.name}${this.newLine}we are happy to confirm you that your trip booking was reserved${this.newLine}`;
      case BookingStatus.RELEASED:
        return `Dear ${this.booking.travelerId}${this.newLine}as yous have requested, your trip booking was annulled${this.newLine}`;
      case BookingStatus.CANCELLED:
        return `Dear ${this.booking.travelerId}${this.newLine}we are sorry to inform you that your trip was cancelled${this.newLine}`;
    }
  }
  private getMainBody(): string {
    return JSON.stringify(this.booking) + this.newLine + JSON.stringify(this.payment);
  }
  private getSignature(): string {
    return "Best regards," + this.newLine + "The Astro Bookings team";
  }
}
