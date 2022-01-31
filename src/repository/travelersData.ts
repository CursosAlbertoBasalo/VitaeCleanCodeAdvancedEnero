import { Traveler } from "../models/traveler";
import { DB } from "../tools/bd";

export class TravelersData {
  public static selectById(travelerId: string) {
    return DB.select<Traveler>(`SELECT * FROM travelers WHERE id = '${travelerId}'`);
  }
}
