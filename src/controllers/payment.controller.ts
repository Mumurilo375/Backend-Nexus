import { NextFunction, Request, Response } from "express";
import Stripe from "stripe";
import {
  finalizeOrderPaymentByCheckoutSessionId,
  markOrderPaymentFailedByCheckoutSessionId,
} from "../services/orders.service";
import { getStripeClient, getStripeWebhookSecret } from "../services/payment-gateway.service";

class PaymentController {
  static async stripeWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const signature = req.headers["stripe-signature"];
      if (!signature || typeof signature !== "string") {
        res.status(400).json({ code: "INVALID_SIGNATURE", message: "Missing stripe signature" });
        return;
      }

      const stripe = getStripeClient();
      const webhookSecret = getStripeWebhookSecret();
      const event = stripe.webhooks.constructEvent(
        req.body as Buffer,
        signature,
        webhookSecret
      );

      if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
        const session = event.data.object as Stripe.Checkout.Session;
        const paymentIntentId =
          typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;

        await finalizeOrderPaymentByCheckoutSessionId(session.id, paymentIntentId ?? undefined);
      }

      if (event.type === "checkout.session.async_payment_failed" || event.type === "checkout.session.expired") {
        const session = event.data.object as Stripe.Checkout.Session;
        await markOrderPaymentFailedByCheckoutSessionId(
          session.id,
          event.type,
          "Payment was not completed at Stripe"
        );
      }

      res.status(200).json({ received: true });
    } catch (error) {
      next(error);
    }
  }
}

export default PaymentController;
