import { GreenOrigin } from "./greenOrigin";
import { IOperatorAPI } from "./operatorApi.interface";
import { SpaceY } from "./spacey";

export class OperatorsApiStrategy {
  public static getOperatorApi(operatorId: string): IOperatorAPI {
    // 🧼 ✅
    // 3.2.1
    // Strategy
    // Change behavior on runtime based on operator
    // Could use a named cache to store the operator API
    // 🧼 ✅
    if (operatorId === "SpaceY") {
      return new SpaceY();
    } else {
      return new GreenOrigin();
    }
  }
}
