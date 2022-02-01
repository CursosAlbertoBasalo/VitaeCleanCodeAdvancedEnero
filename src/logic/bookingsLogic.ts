import { Booking, BookingStatus } from "../models/booking";
import { CreditCard } from "../models/creditCard";
import { DateRange } from "../models/dateRange";
import { Payment } from "../models/payment";
import { Traveler } from "../models/traveler";
import { Trip } from "../models/trip";
import { BookingsData } from "../repository/bookingsData";
import { DB } from "../tools/bd";
import { IEmailSend } from "../tools/emailSend.interface";
import { MailMonk } from "../tools/mailMonk";
import { SMTP } from "../tools/smtp";
import { Notifications } from "./notifications";
import { Payments } from "./payments";
export class BookingLogic {
  private notifications: Notifications;

  private config = "http";
  private emailSender: IEmailSend;
  constructor(private booking: Booking) {
    // 🚨 🤔 🤢
    // 3.1.1
    // ! Factory method -> Factory class
    // ! create Email Sender instance based on configuration
    // 🚨 🤔 🤢
    if (this.config === "http") {
      this.emailSender = new MailMonk();
    } else {
      this.emailSender = new SMTP();
    }
  }

  public notify(traveler: Traveler, payment: Payment) {
    this.notifications = new Notifications(this.emailSender);
    this.notifications.send(traveler, this.booking, payment);
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
  public pay(trip: Trip, card: CreditCard): Payment {
    const payments = new Payments();
    this.booking.price = this.calculatePrice(trip);
    const concept = JSON.stringify(this.booking);
    // 🚨 🤔 🤢
    // ToDo: 1.3.7
    // ToDo: Command-Query segregation
    // 🚨 🤔 🤢
    const payment = payments.payBooking("credit-card", card, this.booking.price, concept);
    this.booking.paymentId = payment.id;
    this.booking.status = BookingStatus.PAID;
    DB.update(this.booking);
    return payment;
  }
  public refund(): Payment {
    const payments = new Payments();
    const chargedPayment = DB.select<Payment>(`SELECT * FROM payments WHERE id = '${this.booking.paymentId}'`);
    const creditCard = new CreditCard(chargedPayment.cardNumber, chargedPayment.cardExpiry, chargedPayment.cardCVC);
    // 🚨 🤔 🤢
    // ToDo: 1.3.7
    // ToDo: Command-Query segregation
    // 🚨 🤔 🤢
    const refundPayment = payments.refundBooking(
      "credit-card",
      creditCard,
      this.booking.price,
      JSON.stringify(this.booking)
    );
    this.booking.refundId = refundPayment.id;
    this.booking.status = BookingStatus.REFUNDED;
    BookingsData.update(this.booking);
    return refundPayment;
  }
  private calculatePrice(trip: Trip): number {
    const dates = new DateRange(trip.startDate, trip.endDate);
    const stayingNights = dates.getNights();
    const stayingPrice = stayingNights * trip.stayingNightPrice;
    const flightPrice = trip.flightPrice + (this.booking.hasPremiumFoods ? trip.premiumFoodPrice : 0);
    const pricePerPassenger = flightPrice + stayingPrice;
    const passengersPrice = pricePerPassenger * this.booking.passengersCount;
    const extraLuggageKilosPrice = this.booking.extraLuggageKilos * trip.extraLuggagePricePerKilo;
    const totalPrice = passengersPrice + extraLuggageKilosPrice;
    return totalPrice;
  }
}
