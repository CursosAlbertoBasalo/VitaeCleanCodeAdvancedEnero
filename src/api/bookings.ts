/* eslint-disable no-magic-numbers */
/* eslint-disable max-statements */
/* eslint-disable max-lines-per-function */
/* eslint-disable max-lines */
/* eslint-disable max-params */
import { Notifications } from "../logic/notifications";
import { Payments } from "../logic/payments";
import { Booking, BookingStatus } from "../models/booking";
import { Payment, PaymentStatus } from "../models/payment";
import { Traveler } from "../models/traveler";
import { Trip } from "../models/trip";
import { DB } from "../tools/bd";
import { Operators } from "./operators";

/**
 * Class for solicite, annulate or cancel bookings
 * @public
 */
export class Bookings {
  // 🚨 🤔 🤢
  // ! 8 efferent dependencies
  // 🚨 🤔 🤢

  private operators: Operators;
  private booking: Booking;
  private trip: Trip;
  private traveler: Traveler;
  private notifications: Notifications;

  /**
   * Solicites a new booking
   * @param {string} travelerId - the id of the traveler soliciting the booking
   * @param {string} tripId - the id of the trip to book
   * @param {number} passengersCount - the number of passengers to reserve
   * @param {string} cardNumber - the card number to pay with
   * @param {string} cardExpiry - the card expiry date
   * @param {string} cardCVC - the card CVC
   * @param {boolean} hasPremiumFoods - if the traveler has premium foods
   * @param {number} extraLuggageKilos - the number of extra luggage kilos
   * @returns {Booking} the new booking object
   * @throws {Error} if the booking is not possible
   * */
  public solicite(
    travelerId: string,
    tripId: string,
    passengersCount: number,
    cardNumber: string,
    cardExpiry: string,
    cardCVC: string,
    hasPremiumFoods: boolean,
    extraLuggageKilos: number
  ): Booking {
    this.create(travelerId, tripId, passengersCount, hasPremiumFoods, extraLuggageKilos);
    this.saveBooking();
    const payment = this.pay(cardNumber, cardExpiry, cardCVC);
    this.reserve();
    this.notify(payment);
    return this.booking;
  }
  /**
   * Annulate an existing booking
   * @param {string} travelerId - the id of the traveler who made the booking
   * @param {string} bookingId - the id of the booking to annulate
   * @returns the booking object annulled
   * @throws {Error} if the booking annulation is not possible
   */
  public annulate(travelerId: string, bookingId: string): Booking {
    this.validateAnnulation(bookingId, travelerId);
    this.saveAnnulation();
    const payment = this.refund();
    this.release();
    this.notify(payment);
    return this.booking;
  }
  /**
   * Cancel a trip and its booking
   * @param {Booking} booking - the booking object to cancel
   * @returns the booking object cancelled
   * @throws {Error} if the booking cancellation is not possible
   * */
  public cancel(booking: Booking) {
    this.booking = booking;
    this.saveCancellation();
    const payment = this.refund();
    this.notify(payment);
  }

  private create(
    travelerId: string,
    tripId: string,
    passengersCount: number,
    hasPremiumFoods: boolean,
    extraLuggageKilos: number
  ) {
    passengersCount = this.validatePassengersCount(travelerId, passengersCount);
    this.checkAvailability(tripId, passengersCount);
    this.booking = new Booking(tripId, travelerId, passengersCount);
    this.booking.hasPremiumFoods = hasPremiumFoods;
    this.booking.extraLuggageKilos = extraLuggageKilos;
  }
  private validatePassengersCount(travelerId: string, passengersCount: number) {
    const maxPassengersPerVIPBooking = 6;
    if (passengersCount > maxPassengersPerVIPBooking) {
      throw new Error("VIPs can't have more than 6 passengers");
    }
    this.traveler = DB.select<Traveler>(`SELECT * FROM travelers WHERE id = '${travelerId}'`);
    const maxPassengersPerBooking = 4;
    if (this.traveler.isVIP === false && passengersCount > maxPassengersPerBooking) {
      throw new Error("Normal travelers can't have more than 4 passengers");
    }
    if (passengersCount <= 0) {
      passengersCount = 1;
    }
    return passengersCount;
  }
  private checkAvailability(tripId: string, passengersCount: number) {
    this.trip = DB.select<Trip>(`SELECT * FROM trips WHERE id = '${tripId}'`);
    this.operators = new Operators(this.trip.operatorId);
    const isAvailable = this.operators.verifyAvailability(this.trip, passengersCount);
    if (!isAvailable) {
      throw new Error("The trip is not available");
    }
  }
  private saveBooking() {
    this.booking.id = DB.insert<Booking>(this.booking);
  }
  private pay(cardNumber: string, cardExpiry: string, cardCVC: string): Payment {
    this.booking.price = this.calculatePrice();
    // 🚨 🤔 🤢
    // ! Tell don't ask
    // 🚨 🤔 🤢
    const payments = new Payments();
    const payment = payments.createPayment(
      "credit-card",
      cardNumber,
      cardExpiry,
      cardCVC,
      this.booking.price,
      JSON.stringify(this.booking)
    );
    if (!payment) {
      throw new Error("Create Payment failed");
    }
    const response = payments.payBooking(payment);
    payment.status = response.status === 200 ? PaymentStatus.PROCESSED : PaymentStatus.REFUSED;
    payment.gatewayCode = response.body["data"]["transaction_number"];
    payments.savePayment(payment);
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
    const flightPrice = this.trip.flightPrice + (this.booking.hasPremiumFoods ? this.trip.premiumFoodPrice : 0);
    const pricePerPassenger = flightPrice + stayingPrice;
    const passengersPrice = pricePerPassenger * this.booking.passengersCount;
    const extraLuggageKilosPrice = this.booking.extraLuggageKilos * this.trip.extraLuggagePricePerKilo;
    const totalPrice = passengersPrice + extraLuggageKilosPrice;
    return totalPrice;
  }
  private reserve() {
    this.booking.operatorReserveCode = this.operators.reserveBooking(this.booking, this.trip);
    this.booking.status = BookingStatus.RESERVED;
    DB.update(this.booking);
  }
  private notify(payment: Payment) {
    this.notifications = new Notifications(this.traveler, this.booking, payment);
    // 🚨 🤔 🤢
    // ! Law of Demeter
    // 🚨 🤔 🤢
    const body =
      this.notifications.emailComposer.getSalutation() +
      this.notifications.emailComposer.getMainBody() +
      this.notifications.emailComposer.getSignature();
    this.notifications.send(body);
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
  private validateAnnulation(bookingId: string, travelerId: string) {
    this.booking = DB.select<Booking>(`SELECT * FROM bookings WHERE id = '${bookingId}'`);
    if (this.booking.travelerId !== travelerId) {
      throw new Error("The traveler is not the owner of the booking");
    }
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
    return refundPayment;
  }
  private release() {
    this.operators.releaseBooking(this.booking);
    this.booking.status = BookingStatus.RELEASED;
    DB.update(this.booking);
  }
  private saveAnnulation() {
    this.booking.status = BookingStatus.ANNULLED;
    DB.update(this.booking);
  }
  private saveCancellation() {
    this.booking.status = BookingStatus.CANCELLED;
    DB.update<Booking>(this.booking);
  }
}
