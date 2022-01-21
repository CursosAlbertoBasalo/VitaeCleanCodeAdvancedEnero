/* eslint-disable no-magic-numbers */
/* eslint-disable max-lines-per-function */
/* eslint-disable max-params */
import { DB } from "./bd";
import { HTTP } from "./http";
import { Payment, PaymentKinds, PaymentStatus } from "./payment";

export class Payments {
  private paymentAPIUrl = "https://pay-me.com/v1/payments";
  public payBooking(
    paymentMethod: string,
    cardNumber: string,
    cardExpiry: string,
    cardCVC: string,
    amount: number,
    concept: string
  ): Payment {
    if (paymentMethod === "credit-card") {
      const payment = new Payment(cardNumber, cardExpiry, cardCVC, amount, concept);
      payment.id = DB.insert<Payment>(payment);
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          operation: PaymentKinds[payment.kind],
          amount,
          cardNumber,
          cardExpiry,
          cardCVC,
        },
      };
      const response = HTTP.request(this.paymentAPIUrl, options);
      payment.status = response.status === 200 ? PaymentStatus.PROCESSED : PaymentStatus.REFUSED;
      payment.gatewayCode = response.body["data"]["transaction_number"];
      DB.update(payment);
      return payment;
    }
  }
  public refundBooking(
    paymentMethod: string,
    cardNumber: string,
    cardExpiry: string,
    cardCVC: string,
    amount: number,
    concept: string
  ): Payment {
    if (paymentMethod === "credit-card") {
      const payment = new Payment(cardNumber, cardExpiry, cardCVC, amount, concept);
      payment.kind = PaymentKinds.REFUND;
      payment.id = DB.insert<Payment>(payment);

      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          operation: PaymentKinds[payment.kind],
          amount,
          cardNumber,
          cardExpiry,
          cardCVC,
        },
      };
      const response = HTTP.request(this.paymentAPIUrl, options);
      payment.status = response.status === 200 ? PaymentStatus.PROCESSED : PaymentStatus.REFUSED;
      payment.gatewayCode = response.body["data"]["transaction_number"];
      DB.update(payment);
      return payment;
    }
  }
}
