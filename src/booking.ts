/* eslint-disable max-params */

export class Booking {
  id = "";
  tripId: string;
  travelerId: string;
  passengersCount: number;
  paymentId: string;
  reserveId: string;
  constructor(tripId: string, travelerId: string, passengersCount: number) {
    this.tripId = tripId;
    this.travelerId = travelerId;
    this.passengersCount = passengersCount;
  }
}
