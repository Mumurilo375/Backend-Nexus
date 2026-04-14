import { AppError } from "../utils/app-error";
import {
  readQueryParams,
  readRequestBody,
  validatePaginationQuery,
  validatePositiveIdParam,
} from "../utils/request-validator";
import { InputValue } from "../utils/value-types";

export interface CreateListingInput {
  gameId: number;
  platformId: number;
  price: number;
}

export interface UpdateListingInput {
  price?: number;
  isActive?: boolean;
}

export interface ListListingsQuery {
  page: number;
  limit: number;
  gameId?: number;
  includeStock?: boolean;
}

function validatePrice(value: InputValue): number {
  const price = Number(value);
  if (!Number.isFinite(price) || price <= 0) {
    throw new AppError(400, "VALIDATION_ERROR", "price must be greater than 0");
  }
  return price;
}

function validateBooleanQuery(value: InputValue, fieldName: string): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  const normalizedValue = String(value ?? "").trim().toLowerCase();

  if (normalizedValue === "true" || normalizedValue === "1") {
    return true;
  }

  if (normalizedValue === "false" || normalizedValue === "0") {
    return false;
  }

  throw new AppError(400, "VALIDATION_ERROR", `${fieldName} must be a boolean`);
}

export function validateListingIdParam(id: string): number {
  return validatePositiveIdParam(id);
}

export function validateCreateListingInput(
  body: InputValue | null | undefined,
): CreateListingInput {
  const requestBody = readRequestBody(body);

  return {
    gameId: validatePositiveIdParam(String(requestBody.gameId ?? "")),
    platformId: validatePositiveIdParam(String(requestBody.platformId ?? "")),
    price: validatePrice(requestBody.price),
  };
}

export function validateUpdateListingInput(
  body: InputValue | null | undefined,
): UpdateListingInput {
  const requestBody = readRequestBody(body);
  const result: UpdateListingInput = {};

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

export function validateListListingsQuery(
  query: InputValue | null | undefined,
): ListListingsQuery {
  const safeQuery = readQueryParams(query);
  const pagination = validatePaginationQuery(safeQuery);
  const includeStock =
    safeQuery.includeStock === undefined
      ? undefined
      : validateBooleanQuery(safeQuery.includeStock, "includeStock");

  if (safeQuery.gameId === undefined) {
    return {
      ...pagination,
      includeStock,
    };
  }

  return {
    ...pagination,
    gameId: validatePositiveIdParam(String(safeQuery.gameId)),
    includeStock,
  };
}
