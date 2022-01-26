export class BookingRequest {
  constructor(
    public readonly travelerId: string,
    public readonly tripId: string,
    public readonly passengersCount: number,
    public readonly cardNumber: string,
    public readonly cardExpiry: string,
    public readonly cardCVC: string,
    public readonly hasPremiumFoods: boolean,
    public readonly extraLuggageKilos: number
  ) {}
}
