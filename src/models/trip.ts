/* eslint-disable max-params */

import { DateRange } from "./dateRange";

export enum TripKinds {
  TRIP_ONLY,
  WITH_STAY,
}

export enum TripStatus {
  WAITING,
  CANCELLED,
  CONFIRMED,
  NOTIFIED,
}

export class Trip {
  id = "";
  operatorId: string;
  operatorTripCode: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  flightPrice: number;
  stayingNightPrice: number;
  kind: TripKinds = TripKinds.WITH_STAY;
  status: TripStatus = TripStatus.WAITING;
  extraLuggagePricePerKilo: number;
  premiumFoodPrice: number;

  constructor(
    operatorId: string,
    destination: string,
    startDate: Date,
    endDate: Date,
    flightPrice: number,
    stayingNightPrice = 0
  ) {
    // 🧼 ✅
    // 1.3.4
    // Primitive obsession
    // Solution: Assert data on constructor
    // 🧼 ✅
    if (flightPrice <= 0) {
      throw new Error("The flight price must be greater than zero");
    }
    const dates = new DateRange(startDate, endDate);
    this.operatorId = operatorId;
    this.destination = destination;
    this.startDate = startDate;
    this.endDate = endDate;
    this.flightPrice = flightPrice;
    this.stayingNightPrice = stayingNightPrice;
  }
}
