import { AppError } from "../utils/app-error";
import {
  readRequestBody,
  validatePositiveIdParam,
} from "../utils/request-validator";
import { InputValue } from "../utils/value-types";

export function validateListingIdParam(id: string): number {
  return validatePositiveIdParam(id);
}

export function validateCartQuantityInput(body: InputValue | null | undefined): number {
  const quantity = Number(readRequestBody(body).quantity);

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new AppError(400, "VALIDATION_ERROR", "quantity must be a positive integer");
  }

  return quantity;
}
