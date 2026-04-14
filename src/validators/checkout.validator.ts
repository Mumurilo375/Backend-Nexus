import { AppError } from "../utils/app-error";
import { readRequestBody } from "../utils/request-validator";
import { InputValue } from "../utils/value-types";

export interface CheckoutInput {
  paymentMethod: "card" | "paypal" | "pix";
}

export function validateCheckoutInput(body: InputValue | null | undefined): CheckoutInput {
  const paymentMethod = String(readRequestBody(body).paymentMethod ?? "")
    .trim()
    .toLowerCase();

  if (!["card", "paypal", "pix"].includes(paymentMethod)) {
    throw new AppError(400, "VALIDATION_ERROR", "paymentMethod must be 'card', 'paypal' or 'pix'");
  }

  return { paymentMethod: paymentMethod as CheckoutInput["paymentMethod"] };
}
