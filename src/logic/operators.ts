/* eslint-disable max-statements */
/* eslint-disable max-lines-per-function */
import { Booking } from "../models/booking";
import { Trip } from "../models/trip";
import { GreenOrigin } from "./greenOrigin";
import { IOperatorAPI } from "./operatorApi.interface";
import { SpaceY } from "./spacey";

export class Operators {
  // 🧼 ✅
  // 2.2.1..3
  // OLI
  // VirginPlanetary added to SpaceY and GreenOrigin as operators
  // 🧼 ✅
  private operatorAPI: IOperatorAPI;

  constructor(private operatorId: string) {
    this.operatorAPI = this.getOperatorApi();
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

  private getOperatorApi() {
    // 🚨 🤔 🤢
    // 3.2.1
    // ! Strategy
    // ! Change behavior on runtime based on operator
    // 🚨 🤔 🤢
    if (this.operatorId === "SpaceY") {
      return new SpaceY();
    } else {
      return new GreenOrigin();
    }
  }
}
