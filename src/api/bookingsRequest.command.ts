import { BookingLogic } from "../logic/bookingsLogic";
import { Operators } from "../logic/operators";
import { Booking, BookingStatus } from "../models/booking";
import { BookingRequest } from "../models/bookingRequest";
import { Payment } from "../models/payment";
import { Traveler } from "../models/traveler";
import { Trip } from "../models/trip";
import { BookingsData } from "../repository/bookingsData";
import { TravelersData } from "../repository/travelersData";
import { TripsData } from "../repository/tripsData";
import { IBookingCommand } from "./bookingCommand.interface";

export class BookingsRequestCommand implements IBookingCommand {
  private booking: Booking;
  private bookingRequest: BookingRequest;
  private operators: Operators;
  private payment: Payment;
  private traveler: Traveler;
  private trip: Trip;

  public execute(bookingRequest: BookingRequest): Booking {
    this.bookingRequest = bookingRequest;
    this.create();
    const logic = new BookingLogic(this.booking);
    this.saveBooking();
    this.payment = logic.pay(this.trip, this.bookingRequest.card);
    this.reserve();
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
    this.traveler = TravelersData.selectById(this.bookingRequest.travelerId);
    const maxPassengersPerBooking = 4;
    if (this.traveler.isVIP === false && passengersCount > maxPassengersPerBooking) {
      throw new Error("Normal travelers can't have more than 4 passengers");
    }
  }
  private checkAvailability() {
    this.trip = TripsData.selectById(this.bookingRequest.tripId);
    this.operators = new Operators(this.trip.operatorId);
    const isAvailable = this.operators.verifyAvailability(this.trip, this.bookingRequest.passengers.count);
    if (!isAvailable) {
      throw new Error("The trip is not available");
    }
  }
  private saveBooking() {
    this.booking.id = BookingsData.insert(this.booking);
  }

  private reserve() {
    this.booking.operatorReserveCode = this.operators.reserveBooking(this.booking, this.trip);
    this.booking.status = BookingStatus.RESERVED;
    BookingsData.update(this.booking);
  }
}
