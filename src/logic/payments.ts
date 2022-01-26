/* eslint-disable no-magic-numbers */
/* eslint-disable max-lines-per-function */
import { Booking } from "../models/booking";
import { Payment, PaymentKinds, PaymentStatus } from "../models/payment";
import { DB } from "../tools/bd";
import { HTTP } from "../tools/http";

export class Payments {
  private paymentAPIUrl = "https://pay-me.com/v1/payments";

  public payBooking(
    booking: Booking,
    paymentMethod: string,
    cardNumber: string,
    cardExpiry: string,
    cardCVC: string
  ): Payment {
    const payment = this.createPayment(
      paymentMethod,
      cardNumber,
      cardExpiry,
      cardCVC,
      booking.price,
      JSON.stringify(booking)
    );
    if (!payment) {
      throw new Error("Create Payment failed");
    }
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
    payment.status = response.status === 200 ? PaymentStatus.PROCESSED : PaymentStatus.REFUSED;
    payment.gatewayCode = response.body["data"]["transaction_number"];
    this.savePayment(payment);
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
      this.savePayment(payment);
      // 🚨 🤔 🤢
      // ! 1.3.7
      // Command-Query separation
      // 🚨 🤔 🤢
      return payment;
    }
  }

  private createPayment(
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
  private savePayment(payment: Payment): Payment {
    DB.update(payment);
    return payment;
  }
}
