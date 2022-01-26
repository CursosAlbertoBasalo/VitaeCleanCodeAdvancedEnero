/* eslint-disable max-statements */
/* eslint-disable max-lines-per-function */
/* eslint-disable max-lines */
import { Notifications } from "../logic/notifications";
import { Operators } from "../logic/operators";
import { Payments } from "../logic/payments";
import { Booking, BookingStatus } from "../models/booking";
import { BookingRequest } from "../models/bookingRequest";
import { CreditCard } from "../models/creditCard";
import { DateRange } from "../models/dateRange";
import { Passengers } from "../models/passengers";
import { Payment } from "../models/payment";
import { Traveler } from "../models/traveler";
import { Trip } from "../models/trip";
import { DB } from "../tools/bd";

/**
 * Class for request, annulate or cancel bookings
 * @public
 */
export class Bookings {
  // 🚨 🤔 🤢
  // ToDo: 1.3.1
  // ToDo: 8 efferent dependencies
  // After SOLID refactors, this class should have less dependencies
  // 🚨 🤔 🤢

  private bookingRequest: BookingRequest;
  private operators: Operators;
  private booking: Booking;
  private trip: Trip;
  private traveler: Traveler;
  private notifications: Notifications;
  private payment: Payment;

  /**
   * Requests a new booking
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
  public request(
    travelerId: string,
    tripId: string,
    passengersCount: number,
    cardNumber: string,
    cardExpiry: string,
    cardCVC: string,
    hasPremiumFoods: boolean,
    extraLuggageKilos: number
  ): Booking {
    this.bookingRequest = new BookingRequest(
      travelerId,
      tripId,
      new Passengers(passengersCount),
      new CreditCard(cardNumber, cardExpiry, cardCVC),
      hasPremiumFoods,
      extraLuggageKilos
    );
    this.create();
    this.saveBooking();
    this.pay();
    this.reserve();
    this.notify();
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
    this.refund();
    this.release();
    this.notify();
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
    this.payment = this.refund();
    this.notify();
  }

  private create() {
    this.validatePassengersCount();
    this.checkAvailability();
    this.booking = new Booking(
      this.bookingRequest.tripId,
      this.bookingRequest.travelerId,
      this.bookingRequest.passengers.count
    );
    this.booking.hasPremiumFoods = this.bookingRequest.hasPremiumFoods;
    this.booking.extraLuggageKilos = this.bookingRequest.extraLuggageKilos;
  }
  private validatePassengersCount() {
    const maxPassengersPerVIPBooking = 6;
    const passengersCount = this.bookingRequest.passengers.count;
    if (passengersCount > maxPassengersPerVIPBooking) {
      throw new Error("VIPs can't have more than 6 passengers");
    }
    this.traveler = DB.select<Traveler>(`SELECT * FROM travelers WHERE id = '${this.bookingRequest.travelerId}'`);
    const maxPassengersPerBooking = 4;
    if (this.traveler.isVIP === false && passengersCount > maxPassengersPerBooking) {
      throw new Error("Normal travelers can't have more than 4 passengers");
    }
    // 🧼 ✅
    // 1.3.7
    // Command-Query segregation
    // 🧼 ✅
  }
  private checkAvailability() {
    this.trip = DB.select<Trip>(`SELECT * FROM trips WHERE id = '${this.bookingRequest.tripId}'`);
    this.operators = new Operators(this.trip.operatorId);
    const isAvailable = this.operators.verifyAvailability(this.trip, this.bookingRequest.passengers.count);
    if (!isAvailable) {
      throw new Error("The trip is not available");
    }
  }
  private saveBooking() {
    this.booking.id = DB.insert<Booking>(this.booking);
  }
  private pay() {
    // 🧼 ✅
    // 1.3.5
    // Tell don't ask
    // 🧼 ✅
    const payments = new Payments();
    this.booking.price = this.calculatePrice();
    const concept = JSON.stringify(this.booking);
    // 🚨 🤔 🤢
    // ToDo: 1.3.7
    // ToDo: Command-Query segregation
    // 🚨 🤔 🤢
    this.payment = payments.payBooking("credit-card", this.bookingRequest.card, this.booking.price, concept);
    // 🧼 ✅
    // 1.3.6
    // Demeter Law
    // 🧼 ✅
    this.booking.paymentId = this.payment.id;
    this.booking.status = BookingStatus.PAID;
    DB.update(this.booking);
  }
  private calculatePrice(): number {
    // 🧼 ✅
    // 1.3.4
    // Primitive obsession
    // Solution: Using a Value Object
    // Alternative: Use a library with date range utilities
    // 🧼 ✅
    const dates = new DateRange(this.trip.startDate, this.trip.endDate);
    const stayingNights = dates.getNights();
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
  private notify() {
    this.notifications = new Notifications(this.traveler, this.booking, this.payment);
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
  private validateAnnulation(bookingId: string, travelerId: string) {
    this.booking = DB.select<Booking>(`SELECT * FROM bookings WHERE id = '${bookingId}'`);
    if (this.booking.travelerId !== travelerId) {
      throw new Error("The traveler is not the owner of the booking");
    }
  }
  private refund() {
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
