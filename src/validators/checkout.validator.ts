import { AppError } from "../utils/app-error";

export interface CheckoutInput {
  paymentMethod: "card" | "paypal" | "pix";
}

export function validateCheckoutInput(body: unknown): CheckoutInput {
  if (!body || typeof body !== "object") {
    throw new AppError(400, "VALIDATION_ERROR", "Request body must be an object");
  }

  const requestBody = body as Record<string, unknown>;
  const paymentMethod = String(requestBody.paymentMethod ?? "").trim().toLowerCase();

  if (!["card", "paypal", "pix"].includes(paymentMethod)) {
    throw new AppError(400, "VALIDATION_ERROR", "paymentMethod must be 'card', 'paypal' or 'pix'");
  }

  return { paymentMethod: paymentMethod as CheckoutInput["paymentMethod"] };
}
