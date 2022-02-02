import { BookingLogic } from "../logic/bookingsLogic";
import { Operators } from "../logic/operators";
import { Booking, BookingStatus } from "../models/booking";
import { BookingAnnulation } from "../models/bookingAnnulation";
import { Payment } from "../models/payment";
import { Traveler } from "../models/traveler";
import { BookingsData } from "../repository/bookingsData";
import { TravelersData } from "../repository/travelersData";
import { IBookingCommand } from "./bookingCommand.interface";

export class BookingsAnnulateCommand implements IBookingCommand {
  private operators: Operators;
  private booking: Booking;
  payment: Payment;
  traveler: Traveler;

  public execute(bookingAnnulation: BookingAnnulation): Booking {
    this.validateAnnulation(bookingAnnulation);
    const logic = new BookingLogic(this.booking);
    this.saveAnnulation();
    this.payment = logic.refund();
    this.release();
    logic.notify(this.traveler, this.payment);
    return this.booking;
  }
  private validateAnnulation(bookingAnnulation: BookingAnnulation) {
    this.traveler = TravelersData.selectById(bookingAnnulation.travelerId);
    this.booking = BookingsData.selectById(bookingAnnulation.bookingId);
    if (this.booking.travelerId !== bookingAnnulation.travelerId) {
      throw new Error("The traveler is not the owner of the booking");
    }
  }

  private release() {
    this.operators.releaseBooking(this.booking);
    this.booking.status = BookingStatus.RELEASED;
    BookingsData.update(this.booking);
  }
  private saveAnnulation() {
    this.booking.status = BookingStatus.ANNULLED;
    BookingsData.update(this.booking);
  }
}
