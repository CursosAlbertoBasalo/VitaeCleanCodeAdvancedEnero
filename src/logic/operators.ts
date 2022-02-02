import { Booking } from "../models/booking";
import { Trip } from "../models/trip";
import { IOperatorAPI } from "./operatorApi.interface";
import { OperatorsApiStrategy } from "./operatorsAPI.strategy";

export class Operators {
  private operatorAPI: IOperatorAPI;

  constructor(operatorId: string) {
    // 🧼 ✅
    // 3.2.1
    // Strategy
    // Calls the strategy factory to get the operator API
    // 🧼 ✅
    this.operatorAPI = OperatorsApiStrategy.getOperatorApi(operatorId);
  }

  public verifyAvailability(trip: Trip, passengersCount: number): boolean {
    return this.operatorAPI.verifyAvailability(trip, passengersCount);
  }
  public reserveBooking(booking: Booking, trip: Trip): string {
    return this.operatorAPI.reserveBooking(booking, trip);
  }
  public releaseBooking(booking: Booking): void {
    return this.operatorAPI.releaseBooking(booking);
  }
}
