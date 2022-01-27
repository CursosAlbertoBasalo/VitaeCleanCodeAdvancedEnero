/* eslint-disable max-params */
/* eslint-disable max-lines-per-function */
import { Booking } from "../models/booking";
import { Trip, TripKinds, TripStatus } from "../models/trip";
import { DB } from "../tools/bd";
import { Bookings } from "./bookings";

/**
 * Class for offering or canceling trips
 * @public
 */
export class Trips {
  // 🚨 🤔 🤢
  // ! 2.1.1
  // ! receive trips processing petitions; but, saving?
  // ! distinct levels of abstraction
  // 🚨 🤔 🤢

  /**
   * Query to get the list of offered trips
   * @returns {Trip[]} the list of offered trips
   */
  public getList(): Trip[] {
    return DB.select<Trip[]>(`SELECT * FROM trips`);
  }
  /**
   * Offers a new trip
   * @param {string} operatorId - the id of the operator offering the trip
   * @param {string} destination - the destination of the trip
   * @param {Date} startDate - the start date of the trip
   * @param {Date} endDate - the end date of the trip
   * @param {number} flightPrice - the price of the flight per passenger
   * @param {number} stayingNightPrice - the price of the staying night per passenger
   * @param {number} extraLuggagePricePerKilo - the price of the extra luggage per kilo
   * @param {number} premiumFoodPrice - the price of the premium food per passenger
   * @returns {Trip} the new trip object
   * @throws {Error} if the trip is not possible
   * */
  public offer(
    operatorId: string,
    destination: string,
    startDate: Date,
    endDate: Date,
    flightPrice: number,
    stayingNightPrice = 0,
    extraLuggagePricePerKilo = 0,
    premiumFoodPrice = 0
  ): Trip {
    const trip = new Trip(operatorId, destination, startDate, endDate, flightPrice, stayingNightPrice);
    if (stayingNightPrice > 0) {
      trip.kind = TripKinds.WITH_STAY;
      trip.extraLuggagePricePerKilo = extraLuggagePricePerKilo;
    } else {
      trip.kind = TripKinds.TRIP_ONLY;
      trip.premiumFoodPrice = premiumFoodPrice;
    }
    trip.id = DB.insert<Trip>(trip);
    return trip;
  }
  /**
   * Cancels an existing trip
   * @param {string} operatorId - the id of the operator who offer the booking
   * @param {string} tripId - the id of the trip to be cancelled
   * @returns the trip object cancelled
   * @throws {Error} if the trip cancellation is not possible
   */
  public cancel(operatorId: string, tripId: string): void {
    const trip = DB.select<Trip>(`SELECT * FROM trips WHERE id = '${tripId}'`);
    if (trip.operatorId !== operatorId) {
      throw new Error("You can't cancel a trip that is not yours");
    }
    trip.status = TripStatus.CANCELLED;
    DB.update<Trip>(trip);
    this.cancelBookings(tripId);
  }
  private cancelBookings(tripId: string) {
    const bookings = DB.select<Booking[]>(`SELECT * FROM bookings WHERE tripId = '${tripId}'`);
    bookings.forEach(booking => {
      new Bookings().cancel(booking);
    });
  }
}
