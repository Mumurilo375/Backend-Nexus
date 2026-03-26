import Stripe from "stripe";
import { AppError } from "../utils/app-error";

let stripeClient: Stripe | null = null;

function getFrontendUrl() {
  return process.env.FRONTEND_URL ?? "http://localhost:5173";
}

export function getStripeClient(): Stripe {
  if (stripeClient) return stripeClient;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new AppError(500, "PAYMENT_CONFIG_ERROR", "STRIPE_SECRET_KEY is not configured");
  }

  stripeClient = new Stripe(secretKey);
  return stripeClient;
}

export function getStripeWebhookSecret(): string {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new AppError(500, "PAYMENT_CONFIG_ERROR", "STRIPE_WEBHOOK_SECRET is not configured");
  }
  return webhookSecret;
}

export type CheckoutPaymentMethod = "card" | "pix";

function getPaymentMethodTypes(method: CheckoutPaymentMethod): Stripe.Checkout.SessionCreateParams.PaymentMethodType[] {
  if (method === "pix") return ["pix"];
  return ["card"];
}

export async function createStripeCheckoutSession(params: {
  orderId: number;
  userId: number;
  amountInCents: number;
  paymentMethodType: CheckoutPaymentMethod;
}) {
  const stripe = getStripeClient();
  const frontendUrl = getFrontendUrl();

  return stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: getPaymentMethodTypes(params.paymentMethodType),
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "brl",
          unit_amount: params.amountInCents,
          product_data: {
            name: `Pedido NEXUS #${params.orderId}`,
            description: "Compra de keys digitais",
          },
        },
      },
    ],
    metadata: {
      orderId: String(params.orderId),
      userId: String(params.userId),
    },
    success_url: `${frontendUrl}/checkout?orderId=${params.orderId}&payment=success`,
    cancel_url: `${frontendUrl}/checkout?orderId=${params.orderId}&payment=cancel`,
  });
}
