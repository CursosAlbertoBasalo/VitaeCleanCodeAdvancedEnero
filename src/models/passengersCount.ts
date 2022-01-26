export class PassengersCount {
  constructor(public readonly count: number) {
    if (count < 1) {
      count = 1;
    }
  }
}
