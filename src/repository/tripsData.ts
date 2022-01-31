import { Trip } from "../models/trip";
import { DB } from "../tools/bd";

export class TripsData {
  public static selectById(tripId: string) {
    return DB.select<Trip>(`SELECT * FROM trips WHERE id = '${tripId}'`);
  }
}
