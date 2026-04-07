import { AppError } from "../utils/app-error";
import { validatePositiveIdParam } from "../utils/request-validator";

export interface UpdateGamePlatformInput {
  price?: number;
  isActive?: boolean;
}

export interface AddGamePlatformKeysInput {
  keyValues: string[];
}

function validatePrice(value: unknown) {
  const rawPrice = typeof value === "number" ? String(value) : String(value ?? "").trim();
  const normalizedPrice =
    rawPrice.includes(",") && rawPrice.includes(".")
      ? rawPrice.lastIndexOf(",") > rawPrice.lastIndexOf(".")
        ? rawPrice.replace(/\./g, "").replace(",", ".")
        : rawPrice.replace(/,/g, "")
      : rawPrice.replace(",", ".");
  const price = Number(normalizedPrice);

  if (!Number.isFinite(price) || price <= 0) {
    throw new AppError(400, "VALIDATION_ERROR", "price must be greater than 0");
  }

  return price;
}

function requireArray(value: unknown, field: string) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new AppError(400, "VALIDATION_ERROR", `${field} must be a non-empty array`);
  }

  return value;
}

export function validatePlatformIdParam(id: string) {
  return validatePositiveIdParam(id);
}

export function validateUpdateGamePlatformInput(body: unknown): UpdateGamePlatformInput {
  if (!body || typeof body !== "object") {
    throw new AppError(400, "VALIDATION_ERROR", "Request body must be an object");
  }

  const requestBody = body as Record<string, unknown>;
  const result: UpdateGamePlatformInput = {};

  if (requestBody.price !== undefined) {
    result.price = validatePrice(requestBody.price);
  }

  if (requestBody.isActive !== undefined) {
    if (typeof requestBody.isActive !== "boolean") {
      throw new AppError(400, "VALIDATION_ERROR", "isActive must be a boolean");
    }

    result.isActive = requestBody.isActive;
  }

  if (Object.keys(result).length === 0) {
    throw new AppError(400, "VALIDATION_ERROR", "At least one field must be provided");
  }

  return result;
}

export function validateAddGamePlatformKeysInput(body: unknown): AddGamePlatformKeysInput {
  if (!body || typeof body !== "object") {
    throw new AppError(400, "VALIDATION_ERROR", "Request body must be an object");
  }

  const requestBody = body as Record<string, unknown>;

  return {
    keyValues: requireArray(requestBody.keyValues, "keyValues").map((value) =>
      String(value ?? ""),
    ),
  };
}
