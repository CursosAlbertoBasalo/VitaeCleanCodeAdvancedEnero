import { Trip } from "./trip";

export class Trips {
  public getOffers(): Trip[] {
    return undefined;
  }
  // eslint-disable-next-line max-params
  public offerTrip(
    destination: string,
    startDate: Date,
    endDate: Date,
    flightPrice: number,
    stayingNightPrice = 0
  ): Trip {
    console.log(destination, startDate, endDate, flightPrice, stayingNightPrice);
    return undefined;
  }
  public cancelTrip(tripId: string): void {
    console.log(tripId);
    return undefined;
  }
}
