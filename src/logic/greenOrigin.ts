import { Booking } from "../models/booking";
import { Trip } from "../models/trip";
import { HTTP } from "../tools/http";
import { IOperatorAPI } from "./operatorApi.interface";

export class GreenOrigin implements IOperatorAPI {
  private readonly operatorAPIUrl: string = "https://greenorigin.com/api/";
  public verifyAvailability(trip: Trip, passengersCount: number): boolean {
    const body = {
      destination: trip.destination,
      startDate: trip.startDate,
      endDate: trip.endDate,
    };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "text/json",
      },
      body: JSON.stringify(body),
    };
    const url = this.operatorAPIUrl + "flights/availability";
    const response = HTTP.request(url, options);
    return (response.body["data"] as number) > passengersCount;
  }

  public reserveBooking(booking: Booking, trip: Trip): string {
    const body = {
      destination: trip.destination,
      startDate: trip.startDate,
      endDate: trip.endDate,
      passengers: booking.passengersCount,
    };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "text/json",
      },
      body: JSON.stringify(body),
    };
    const url = this.operatorAPIUrl + "flights/reserve";
    const response = HTTP.request(url, options);
    return response.body["data"]["reserveCode"] as string;
  }
  public releaseBooking(booking: Booking): void {
    const body = {
      voucherId: booking.operatorReserveCode,
      passengers: booking.passengersCount,
    };

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "text/json",
      },
      body: JSON.stringify(body),
    };
    const url = this.operatorAPIUrl + "flights/reserve";
    HTTP.request(url, options);
    return;
  }
}
