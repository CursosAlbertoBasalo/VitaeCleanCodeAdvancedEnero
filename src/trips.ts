/* eslint-disable max-params */
/* eslint-disable max-lines-per-function */
import { DB } from "./bd";
import { Booking } from "./booking";
import { Bookings } from "./bookings";
import { Trip, TripKinds, TripStatus } from "./trip";

export class Trips {
  public getOffers(): Trip[] {
    return DB.select<Trip[]>(`SELECT * FROM trips`);
  }

  public offerTrip(
    operatorId: string,
    destination: string,
    startDate: Date,
    endDate: Date,
    flightPrice: number,
    stayingNightPrice = 0
  ): Trip {
    if (startDate > endDate) {
      throw new Error("The start date must be before the end date");
    }
    if (flightPrice <= 0) {
      throw new Error("The flight price must be greater than zero");
    }
    const trip = new Trip(operatorId, destination, startDate, endDate, flightPrice, stayingNightPrice);
    if (stayingNightPrice > 0) {
      trip.kind = TripKinds.WITH_STAY;
    }
    trip.id = DB.insert<Trip>(trip);
    return trip;
  }
  public cancelTrip(operatorId: string, tripId: string): void {
    console.log(operatorId, tripId);
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
