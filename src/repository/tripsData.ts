import { Trip } from "../models/trip";
import { DB } from "../tools/bd";

export class TripsData {
  public static selectAll(): Trip[] {
    return DB.select<Trip[]>(`SELECT * FROM trips`);
  }

  public static selectById(tripId: string) {
    return DB.select<Trip>(`SELECT * FROM trips WHERE id = '${tripId}'`);
  }

  public static insert(trip: Trip): string {
    trip.id = DB.insert<Trip>(trip);
    return trip.id;
  }
  public static update(trip: Trip): number {
    return DB.update(trip);
  }
}
