/* eslint-disable max-params */
import { CreditCard } from "./creditCard";
import { Passengers } from "./passengers";

export class BookingRequest {
  constructor(
    public readonly travelerId: string,
    public readonly tripId: string,
    public readonly passengers: Passengers,
    public readonly card: CreditCard,
    public readonly hasPremiumFoods: boolean,
    public readonly extraLuggageKilos: number
  ) {}
}
