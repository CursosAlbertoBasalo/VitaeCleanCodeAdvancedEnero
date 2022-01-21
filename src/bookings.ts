/* eslint-disable max-lines-per-function */
/* eslint-disable max-lines */
/* eslint-disable max-params */
import { DB } from "./bd";
import { Booking, BookingStatus } from "./booking";
import { Notifications } from "./notifications";
import { Operators } from "./operators";
import { Payment, PaymentStatus } from "./payment";
import { Payments } from "./payments";
import { Traveler } from "./traveler";
import { Trip } from "./trip";

export class Bookings {
  operators: Operators;
  booking: Booking;
  trip: Trip;
  traveler: Traveler;
  notifications: Notifications;

  public solicite(
    travelerId: string,
    tripId: string,
    passengersCount: number,
    cardNumber: string,
    cardExpiry: string,
    cardCVC: string
  ): Booking {
    this.create(travelerId, tripId, passengersCount);
    const payment = this.pay(cardNumber, cardExpiry, cardCVC);
    this.reserve();
    this.confirm(payment);
    return this.booking;
  }

  public annulate(travelerId: string, bookingId: string): Booking {
    this.booking = DB.select<Booking>(`SELECT * FROM bookings WHERE id = '${bookingId}'`);
    if (this.booking.travelerId !== travelerId) {
      throw new Error("The traveler is not the owner of the booking");
    }
    this.booking.status = BookingStatus.ANNULLED;
    DB.update(this.booking);
    this.refund();
    this.release();
    return this.booking;
  }

  private create(travelerId: string, tripId: string, passengersCount: number) {
    if (passengersCount <= 0) {
      passengersCount = 1;
    }
    this.traveler = DB.select<Traveler>(`SELECT * FROM travelers WHERE id = '${travelerId}'`);
    this.validatePassengersCount(passengersCount);
    this.trip = DB.select<Trip>(`SELECT * FROM trips WHERE id = '${tripId}'`);
    this.operators = new Operators(this.trip.operatorId);
    this.checkAvailability(passengersCount);
    this.booking = new Booking(tripId, travelerId, passengersCount);
    this.booking.id = DB.insert<Booking>(this.booking);
  }
  private validatePassengersCount(passengersCount: number) {
    const maxPassengersPerVIPBooking = 6;
    if (passengersCount > maxPassengersPerVIPBooking) {
      throw new Error("VIPs can't have more than 6 passengers");
    }
    const maxPassengersPerBooking = 4;
    if (this.traveler.isVIP === false && passengersCount > maxPassengersPerBooking) {
      throw new Error("Normal travelers can't have more than 4 passengers");
    }
  }
  private checkAvailability(passengersCount: number) {
    const isAvailable = this.operators.verifyAvailability(this.trip, passengersCount);
    if (!isAvailable) {
      throw new Error("The trip is not available");
    }
  }
  private pay(cardNumber: string, cardExpiry: string, cardCVC: string): Payment {
    this.booking.price = this.calculatePrice();
    const payments = new Payments();
    const payment = payments.payBooking(
      "credit-card",
      cardNumber,
      cardExpiry,
      cardCVC,
      this.booking.price,
      JSON.stringify(this.booking)
    );
    if (payment.status === PaymentStatus.REFUSED) {
      throw new Error("The payment was refused");
    }
    this.booking.paymentId = payment.id;
    this.booking.status = BookingStatus.PAID;
    DB.update(this.booking);
    return payment;
  }
  private calculatePrice(): number {
    // eslint-disable-next-line no-magic-numbers
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const stayingMilliseconds = this.trip.endDate.getTime() - this.trip.startDate.getTime();
    const stayingNights = Math.round(stayingMilliseconds / millisecondsPerDay);
    const stayingPrice = stayingNights * this.trip.stayingNightPrice;
    const pricePerPassenger = this.trip.flightPrice + stayingPrice;
    const totalPrice = pricePerPassenger * this.booking.passengersCount;
    return totalPrice;
  }
  private reserve() {
    this.booking.operatorReserveCode = this.operators.reserveBooking(this.booking, this.trip);
    this.booking.status = BookingStatus.RESERVED;
    DB.update(this.booking);
  }
  private confirm(payment: Payment) {
    this.notifications = new Notifications();
    this.notifications.send(this.traveler, this.booking, payment);
    this.booking.status = BookingStatus.CONFIRMED;
    DB.update(this.booking);
  }
  private refund() {
    const payments = new Payments();
    const chargedPayment = DB.select<Payment>(`SELECT * FROM payments WHERE id = '${this.booking.paymentId}'`);
    const refundPayment = payments.refundBooking(
      "credit-card",
      chargedPayment.cardNumber,
      chargedPayment.cardExpiry,
      chargedPayment.cardCVC,
      this.booking.price,
      JSON.stringify(this.booking)
    );
    this.booking.refundId = refundPayment.id;
    this.booking.status = BookingStatus.REFUNDED;
    DB.update(this.booking);
  }
  private release() {
    this.operators.releaseBooking(this.booking);
    this.booking.status = BookingStatus.RELEASED;
    DB.update(this.booking);
  }
}
