export class CreditCard {
  constructor(public readonly number: string, public readonly expiry: string, public readonly cvc: string) {
    if (number.length != 16) {
      throw new Error("Invalid card number");
    }
    if (expiry.length != 4) {
      throw new Error("Invalid card expiry");
    }
    if (cvc.length != 3) {
      throw new Error("Invalid card CVC");
    }
  }
}
