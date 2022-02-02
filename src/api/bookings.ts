/* eslint-disable max-params */

import { Booking } from "../models/booking";
import { BookingAnnulation } from "../models/bookingAnnulation";
import { BookingRequest } from "../models/bookingRequest";
import { CreditCard } from "../models/creditCard";
import { Passengers } from "../models/passengers";
import { BookingsAnnulateCommand } from "./bookingsAnnulate.command";
import { BookingsRequestCommand } from "./bookingsRequest.command";

/**
 * Class for request, annulate or cancel bookings
 * @public
 */
export class Bookings {
  // 🧼 ✅
  // 3.2.1
  // Facade
  // keep a single public API for booking operations hiding the rest of the system
  // 🧼 ✅
  // 🧼 ✅
  // 3.2.2
  // Adapter
  // Transforms the primitive request data into a bookingRequest object
  // This could also be a DTO being transformed into a domain object
  // 🧼 ✅

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
    const bookingRequest = new BookingRequest(
      travelerId,
      tripId,
      new Passengers(passengersCount),
      new CreditCard(cardNumber, cardExpiry, cardCVC),
      hasPremiumFoods,
      extraLuggageKilos
    );
    return new BookingsRequestCommand().execute(bookingRequest);
  }

  /**
   * Annulate an existing booking
   * @param {string} travelerId - the id of the traveler who made the booking
   * @param {string} bookingId - the id of the booking to annulate
   * @returns the booking object annulled
   * @throws {Error} if the booking annulation is not possible
   */
  public annulate(travelerId: string, bookingId: string): Booking {
    const bookingAnnulation = new BookingAnnulation(travelerId, bookingId);
    return new BookingsAnnulateCommand().execute(bookingAnnulation);
  }
  // 🧼 ✅
  // 3.3.2
  // Command
  // execute bookings commands based on name and arguments
  // may be coming form a subscription or an event source
  // command could have a base class with pre or post execute methods
  // allows for undoing the command, logging...
  // 🧼 ✅
  public executeCommand(command: string, args: unknown): Booking {
    switch (command) {
      case "request":
        return new BookingsRequestCommand().execute(args as BookingRequest);
      case "annulate":
        return new BookingsAnnulateCommand().execute(args as BookingAnnulation);
      default:
        throw new Error("Unknown command");
    }
  }
}
