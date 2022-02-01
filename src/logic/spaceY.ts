/* eslint-disable max-statements */
/* eslint-disable max-lines-per-function */
import { Booking } from "../models/booking";
import { Trip } from "../models/trip";
import { HTTP } from "../tools/http";
import { IOperatorsAPI } from "./operatorsAPI.interface";
const OK = 200;
export class SpaceY implements IOperatorsAPI {
  private readonly operatorAPIUrl = "https://api.spacey.com/v1/";

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
    return response.status === OK;
  }

  public reserveBooking(booking: Booking, trip: Trip): string {
    let body = {};
    if (this.operatorId === "SpaceY") {
      body = { tripId: booking.tripId, seats: booking.passengersCount };
    } else {
      body = {
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        passengers: booking.passengersCount,
      };
    }
    const options = {
      method: "POST",
      headers: {
        "Content-Type": this.operatorId === "SpaceY" ? "application/json" : "text/json",
      },
      body: this.operatorId === "SpaceY" ? body : JSON.stringify(body),
    };
    let url = this.operatorAPIUrl;
    if (this.operatorId === "SpaceY") {
      url += "bookings";
    } else {
      url += "flights/reserve";
    }
    const response = HTTP.request(url, options);
    if (this.operatorId === "SpaceY") {
      return response.body as string;
    } else {
      return response.body["data"]["reserveCode"] as string;
    }
  }
  public releaseBooking(booking: Booking): void {
    let body = {};
    if (this.operatorId === "SpaceY") {
      body = {};
    } else {
      body = {
        voucherId: booking.operatorReserveCode,
        passengers: booking.passengersCount,
      };
    }
    const options = {
      method: this.operatorId === "SpaceY" ? "DELETE" : "POST",
      headers: {
        "Content-Type": this.operatorId === "SpaceY" ? "application/json" : "text/json",
      },
      body: this.operatorId === "SpaceY" ? body : JSON.stringify(body),
    };
    let url = this.operatorAPIUrl;
    if (this.operatorId === "SpaceY") {
      url += "bookings/" + booking.operatorReserveCode;
    } else {
      url += "flights/reserve";
    }
    HTTP.request(url, options);
    return;
  }
}
