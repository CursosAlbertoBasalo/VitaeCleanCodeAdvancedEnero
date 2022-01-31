import { Booking } from "../models/booking";
import { Trip } from "../models/trip";
import { HTTP } from "../tools/http";
import { IOperatorAPI } from "./operatorApi.interface";

export class SpaceY implements IOperatorAPI {
  private readonly operatorAPIUrl: string = "https://api.spacey.com/v1/";

  public verifyAvailability(trip: Trip, passengersCount: number): boolean {
    const body = { tripId: trip.id, seats: passengersCount };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body,
    };
    const url = this.operatorAPIUrl + "trips/verify";
    const response = HTTP.request(url, options);
    const OK = 200;
    return response.status === OK;
  }
  public reserveBooking(booking: Booking): string {
    const body = { tripId: booking.tripId, seats: booking.passengersCount };

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body,
    };
    const url = this.operatorAPIUrl + "bookings";

    const response = HTTP.request(url, options);
    return response.body as string;
  }
  public releaseBooking(booking: Booking): void {
    const body = {};

    const options = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: body,
    };
    const url = this.operatorAPIUrl + "bookings/" + booking.operatorReserveCode;
    HTTP.request(url, options);
    return;
  }
}
