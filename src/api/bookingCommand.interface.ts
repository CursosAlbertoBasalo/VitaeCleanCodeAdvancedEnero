import { Booking } from "../models/booking";

export interface IBookingCommand {
  execute(...args: [unknown]): Booking;
}
