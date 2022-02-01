/* eslint-disable max-lines-per-function */
import { BookingsLogic } from "../logic/bookingsLogic";
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
import { BookingsData } from "../repository/bookingsData";
import { DB } from "../tools/bd";

export class BookingCreate {
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
    const logic = new BookingsLogic(this.booking);
    logic.notify(this.traveler, this.payment);
    return this.booking;
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
    this.booking.id = BookingsData.insert(this.booking);
  }
  private pay() {
    const payments = new Payments();
    this.booking.price = this.calculatePrice();
    const concept = JSON.stringify(this.booking);
    // 🚨 🤔 🤢
    // ToDo: 1.3.7
    // ToDo: Command-Query segregation
    // 🚨 🤔 🤢
    this.payment = payments.payBooking("credit-card", this.bookingRequest.card, this.booking.price, concept);
    this.booking.paymentId = this.payment.id;
    this.booking.status = BookingStatus.PAID;
    DB.update(this.booking);
  }
  private calculatePrice(): number {
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
}
