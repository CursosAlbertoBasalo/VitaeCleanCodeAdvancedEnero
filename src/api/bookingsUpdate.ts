import { BookingLogic } from "../logic/bookingsLogic";
import { Operators } from "../logic/operators";
import { Booking, BookingStatus } from "../models/booking";
import { Payment } from "../models/payment";
import { Traveler } from "../models/traveler";
import { BookingsData } from "../repository/bookingsData";
import { TravelersData } from "../repository/travelersData";

/**
 * Class for request, annulate or cancel bookings
 * @public
 */
export class BookingsUpdate {
  private operators: Operators;
  private booking: Booking;
  payment: Payment;
  traveler: Traveler;
  /**
   * Annulate an existing booking
   * @param {string} travelerId - the id of the traveler who made the booking
   * @param {string} bookingId - the id of the booking to annulate
   * @returns the booking object annulled
   * @throws {Error} if the booking annulation is not possible
   */
  public annulate(travelerId: string, bookingId: string): Booking {
    this.validateAnnulation(bookingId, travelerId);
    const logic = new BookingLogic(this.booking);
    this.saveAnnulation();
    this.payment = logic.refund();
    this.release();
    logic.notify(this.traveler, this.payment);
    return this.booking;
  }
  /**
   * Cancel a trip and its booking
   * @param {Booking} booking - the booking object to cancel
   * @returns the booking object cancelled
   * @throws {Error} if the booking cancellation is not possible
   * */
  public cancel(booking: Booking) {
    this.booking = booking;
    const logic = new BookingLogic(this.booking);
    this.traveler = TravelersData.selectById(this.booking.travelerId);
    this.saveCancellation();
    this.payment = logic.refund();
    logic.notify(this.traveler, this.payment);
  }
  private validateAnnulation(bookingId: string, travelerId: string) {
    this.traveler = TravelersData.selectById(travelerId);
    this.booking = BookingsData.selectById(bookingId);
    if (this.booking.travelerId !== travelerId) {
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
  private saveCancellation() {
    this.booking.status = BookingStatus.CANCELLED;
    BookingsData.update(this.booking);
  }
}
