import { AppError } from "../utils/app-error";

export interface CheckoutInput {
  paymentMethod: "card" | "pix";
}

export function validateCheckoutInput(body: unknown): CheckoutInput {
  if (!body || typeof body !== "object") {
    throw new AppError(400, "VALIDATION_ERROR", "Request body must be an object");
  }

  const requestBody = body as Record<string, unknown>;
  const paymentMethod = String(requestBody.paymentMethod ?? "").trim().toLowerCase();

  if (paymentMethod !== "card" && paymentMethod !== "pix") {
    throw new AppError(400, "VALIDATION_ERROR", "paymentMethod must be 'card' or 'pix'");
  }

  return { paymentMethod: paymentMethod as "card" | "pix" };
}
