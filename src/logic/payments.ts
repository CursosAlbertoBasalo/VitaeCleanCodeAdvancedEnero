/* eslint-disable no-magic-numbers */
/* eslint-disable max-lines-per-function */
/* eslint-disable max-params */
import { Payment, PaymentKinds, PaymentStatus } from "../models/payment";
import { DB } from "../tools/bd";
import { HTTP, Response } from "../tools/http";

export class Payments {
  private paymentAPIUrl = "https://pay-me.com/v1/payments";
  public createPayment(
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
      return payment;
    }
  }
  public payBooking(payment: Payment): Response {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        operation: PaymentKinds[payment.kind],
        amount: payment.amount,
        cardNumber: payment.cardNumber,
        cardExpiry: payment.cardExpiry,
        cardCVC: payment.cardCVC,
      },
    };
    const response = HTTP.request(this.paymentAPIUrl, options);
    return response;
  }
  public savePayment(payment: Payment): Payment {
    DB.update(payment);
    return payment;
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
      // 🚨 🤔 🤢
      // ! 1.3
      // Command-Query separation
      // 🚨 🤔 🤢
      return payment;
    }
  }
}
