/* eslint-disable max-params */

export enum BookingStatus {
  SOLICITED,
  PAID,
  RESERVED,
  CONFIRMED,
  ANNULLED,
  REFUNDED,
  RELEASED,
  CANCELLED,
  NOTIFIED,
}

export class Booking {
  id = "";
  tripId: string;
  travelerId: string;
  passengersCount: number;
  status: BookingStatus = BookingStatus.SOLICITED;
  price: number;
  operatorReserveCode: string;
  paymentId: string;
  refundId: string;
  constructor(tripId: string, travelerId: string, passengersCount: number) {
    this.tripId = tripId;
    this.travelerId = travelerId;
    this.passengersCount = passengersCount;
  }
}
