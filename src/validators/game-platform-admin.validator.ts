import { AppError } from "../utils/app-error";
import {
  readRequestBody,
  validatePositiveIdParam,
} from "../utils/request-validator";
import { InputValue } from "../utils/value-types";

export interface UpdateGamePlatformInput {
  price?: number;
  isActive?: boolean;
}

export interface AddGamePlatformKeysInput {
  keyValues: string[];
}

function validatePrice(value: InputValue) {
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

function requireArray(value: InputValue, field: string): InputValue[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new AppError(400, "VALIDATION_ERROR", `${field} must be a non-empty array`);
  }

  return value;
}

function normalizeGameKeyValue(value: InputValue) {
  const rawKeyValue = String(value ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");

  if (rawKeyValue.length !== 12) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "Each key must use the format XXXX-XXXX-XXXX",
    );
  }

  return rawKeyValue.match(/.{1,4}/g)?.join("-") ?? rawKeyValue;
}

export function validatePlatformIdParam(id: string) {
  return validatePositiveIdParam(id);
}

export function validateUpdateGamePlatformInput(
  body: InputValue | null | undefined,
): UpdateGamePlatformInput {
  const requestBody = readRequestBody(body);
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

export function validateAddGamePlatformKeysInput(
  body: InputValue | null | undefined,
): AddGamePlatformKeysInput {
  const requestBody = readRequestBody(body);

  return {
    keyValues: requireArray(requestBody.keyValues, "keyValues").map(normalizeGameKeyValue),
  };
}
