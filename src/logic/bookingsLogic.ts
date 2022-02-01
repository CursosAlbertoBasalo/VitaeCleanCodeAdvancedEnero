import { Booking, BookingStatus } from "../models/booking";
import { Payment } from "../models/payment";
import { Traveler } from "../models/traveler";
import { DB } from "../tools/bd";
import { MailMonk } from "../tools/mailMonk";
import { Notifications } from "./notifications";

export class BookingsLogic {
  private booking: Booking;
  private notifications: Notifications;

  constructor(booking: Booking) {
    this.booking = booking;
  }

  public notify(traveler: Traveler, payment: Payment) {
    const emailSender = new MailMonk();
    this.notifications = new Notifications(emailSender, traveler, this.booking, payment);
    this.notifications.send();
    switch (this.booking.status) {
      case BookingStatus.RESERVED:
        this.booking.status = BookingStatus.BOOKING_NOTIFIED;
        break;
      case BookingStatus.RELEASED:
        this.booking.status = BookingStatus.ANNULATION_NOTIFIED;
        break;
      case BookingStatus.CANCELLED:
        this.booking.status = BookingStatus.CANCELLATION_NOTIFIED;
        break;
    }
    DB.update(this.booking);
  }
}
