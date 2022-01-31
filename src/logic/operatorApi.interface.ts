import { Booking } from "../models/booking";
import { Trip } from "../models/trip";

export interface IOperatorAPI {
  verifyAvailability(trip: Trip, passengersCount: number): boolean;
  reserveBooking(booking: Booking, trip?: Trip): string;
  releaseBooking(booking: Booking): void;
}
