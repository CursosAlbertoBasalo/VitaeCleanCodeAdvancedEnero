import { Trip } from "./trip";

export class Trips {
  public getOffers(): Trip[] {
    return undefined;
  }
  // eslint-disable-next-line max-params
  public offerTrip(
    operatorId: string,
    destination: string,
    startDate: Date,
    endDate: Date,
    flightPrice: number,
    stayingNightPrice = 0
  ): Trip {
    console.log(operatorId, destination, startDate, endDate, flightPrice, stayingNightPrice);
    return undefined;
  }
  public cancelTrip(operatorId: string, tripId: string): void {
    console.log(operatorId, tripId);
    return undefined;
  }
}
