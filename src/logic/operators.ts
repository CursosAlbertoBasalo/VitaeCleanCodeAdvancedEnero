/* eslint-disable max-statements */
/* eslint-disable max-lines-per-function */
import { Booking } from "../models/booking";
import { Trip } from "../models/trip";
import { HTTP } from "../tools/http";

const OK = 200;

export class Operators {
  // 🚨 🤔 🤢
  // ! 2.2
  // ! OLI
  // ! VirginPlanetary added to SpaceY and GreenOrigin as operators
  // 🚨 🤔 🤢
  private operatorAPIUrl: string;

  constructor(private operatorId: string) {
    this.operatorAPIUrl = this.getOperatorApiUrl();
  }

  public verifyAvailability(trip: Trip, passengersCount: number): boolean {
    let body = {};
    if (this.operatorId === "SpaceY") {
      body = { tripId: trip.id, seats: passengersCount };
    } else {
      body = {
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
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
      url += "trips/verify";
    } else {
      url += "flights/availability";
    }
    const response = HTTP.request(url, options);
    if (this.operatorId === "SpaceY") {
      return response.status === OK;
    } else {
      return (response.body["data"] as number) > passengersCount;
    }
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

  private getOperatorApiUrl() {
    if (this.operatorId === "SpaceY") {
      return "https://api.spacey.com/v1/";
    } else {
      return "https://greenorigin.com/api/";
    }
  }
}
