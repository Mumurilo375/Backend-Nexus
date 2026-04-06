import { AppError } from "../utils/app-error";
import { validatePositiveIdParam } from "../utils/request-validator";

export function validateListingIdParam(id: string): number {
  return validatePositiveIdParam(id);
}

export function validateCartQuantityInput(body: unknown): number {
  if (!body || typeof body !== "object") {
    throw new AppError(400, "VALIDATION_ERROR", "Request body must be an object");
  }

  const quantity = Number((body as Record<string, unknown>).quantity);
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new AppError(400, "VALIDATION_ERROR", "quantity must be a positive integer");
  }

  return quantity;
}
