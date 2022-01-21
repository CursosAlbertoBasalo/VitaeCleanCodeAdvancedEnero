import { Booking } from "./booking";

export class Operators {
  private operatorAPIUrl: string;

  constructor(private operatorId: string) {
    this.operatorAPIUrl = this.getOperatorApiUrl(operatorId);
  }

  public verifyAvailability(tripId: string, passengersCount: number): boolean {
    console.log(tripId, passengersCount);
    return undefined;
  }
  public reserveBooking(booking: Booking): string {
    console.log(booking);
    return undefined;
  }
  public releaseBooking(booking: Booking): void {
    console.log(booking);
    return undefined;
  }

  private getOperatorApiUrl(operator: string) {
    if (operator === "SpaceY") {
      return "https://spacey.com/api/v1/flights";
    } else {
      return "https://greenorigin.com/api/v1/flights";
    }
  }
}
