export class TripOffer {
  constructor(
    public readonly operatorId: string,
    public readonly destination: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly flightPrice: number,
    public readonly stayingNightPrice = 0,
    public readonly extraLuggagePricePerKilo = 0,
    public readonly premiumFoodPrice = 0
  ) {}
}
