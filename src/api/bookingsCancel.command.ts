import { BookingLogic } from "../logic/bookingsLogic";
import { Booking, BookingStatus } from "../models/booking";
import { Payment } from "../models/payment";
import { Traveler } from "../models/traveler";
import { BookingsData } from "../repository/bookingsData";
import { TravelersData } from "../repository/travelersData";
import { IBookingCommand } from "./bookingCommand.interface";

export class BookingsCancelCommand implements IBookingCommand {
  private booking: Booking;
  payment: Payment;
  traveler: Traveler;

  public execute(booking: Booking) {
    this.booking = booking;
    const logic = new BookingLogic(this.booking);
    this.traveler = TravelersData.selectById(this.booking.travelerId);
    this.saveCancellation();
    this.payment = logic.refund();
    logic.notify(this.traveler, this.payment);
    return this.booking;
  }
  private saveCancellation() {
    this.booking.status = BookingStatus.CANCELLED;
    BookingsData.update(this.booking);
  }
}
