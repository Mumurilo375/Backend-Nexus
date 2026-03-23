import { AppError } from "../utils/app-error";

export interface CheckoutInput {
  paymentMethod: string;
}

export function validateCheckoutInput(body: unknown): CheckoutInput {
  if (!body || typeof body !== "object") {
    throw new AppError(400, "VALIDATION_ERROR", "Request body must be an object");
  }

  const requestBody = body as Record<string, unknown>;
  const paymentMethod = String(requestBody.paymentMethod ?? "").trim();

  if (!paymentMethod) {
    throw new AppError(400, "VALIDATION_ERROR", "paymentMethod is required");
  }

  if (paymentMethod.length > 50) {
    throw new AppError(400, "VALIDATION_ERROR", "paymentMethod must have at most 50 characters");
  }

  return { paymentMethod };
}
