/* eslint-disable max-lines-per-function */
import { CreditCard } from "../models/creditCard";
import { Payment, PaymentKinds, PaymentStatus } from "../models/payment";
import { DB } from "../tools/bd";
import { HTTP } from "../tools/http";

const OK = 200;

export class Payments {
  private paymentAPIUrl = "https://pay-me.com/v1/payments";

  public payBooking(paymentMethod: string, creditCard: CreditCard, amount: number, concept: string): Payment {
    if (paymentMethod === "credit-card") {
      const payment = this.createPayment(paymentMethod, creditCard, amount, concept);
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
      payment.status = response.status === OK ? PaymentStatus.PROCESSED : PaymentStatus.REFUSED;
      payment.gatewayCode = response.body["data"]["transaction_number"];
      this.savePayment(payment);
      if (payment.status === PaymentStatus.REFUSED) {
        throw new Error("The payment was refused");
      }
      // 🚨 🤔 🤢
      // 1.3.7
      // ToDo: Command-Query separation
      // 🚨 🤔 🤢
      return payment;
    }
  }

  public refundBooking(paymentMethod: string, creditCard: CreditCard, amount: number, concept: string): Payment {
    if (paymentMethod === "credit-card") {
      const payment = new Payment(creditCard.number, creditCard.expiry, creditCard.cvc, amount, concept);
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
          cardNumber: creditCard.number,
          cardExpiry: creditCard.expiry,
          cardCVC: creditCard.cvc,
        },
      };
      const response = HTTP.request(this.paymentAPIUrl, options);
      payment.status = response.status === OK ? PaymentStatus.PROCESSED : PaymentStatus.REFUSED;
      payment.gatewayCode = response.body["data"]["transaction_number"];
      this.savePayment(payment);
      // 🚨 🤔 🤢
      // 1.3.7
      // ToDo: Command-Query separation
      // 🚨 🤔 🤢
      return payment;
    }
  }

  private createPayment(paymentMethod: string, creditCard: CreditCard, amount: number, concept: string): Payment {
    if (paymentMethod === "credit-card") {
      const payment = new Payment(creditCard.number, creditCard.expiry, creditCard.cvc, amount, concept);
      payment.id = DB.insert<Payment>(payment);
      return payment;
    }
  }
  private savePayment(payment: Payment): Payment {
    DB.update(payment);
    return payment;
  }
}
