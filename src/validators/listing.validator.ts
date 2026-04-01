import { AppError } from "../utils/app-error";
import { validatePaginationQuery, validatePositiveIdParam } from "../utils/request-validator";

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
}

function validatePrice(value: unknown): number {
  const price = Number(value);
  if (!Number.isFinite(price) || price <= 0) {
    throw new AppError(400, "VALIDATION_ERROR", "price must be greater than 0");
  }
  return price;
}

export function validateListingIdParam(id: string): number {
  return validatePositiveIdParam(id);
}

export function validateCreateListingInput(body: unknown): CreateListingInput {
  if (!body || typeof body !== "object") {
    throw new AppError(400, "VALIDATION_ERROR", "Request body must be an object");
  }

  const requestBody = body as Record<string, unknown>;

  return {
    gameId: validatePositiveIdParam(String(requestBody.gameId ?? "")),
    platformId: validatePositiveIdParam(String(requestBody.platformId ?? "")),
    price: validatePrice(requestBody.price),
  };
}

export function validateUpdateListingInput(body: unknown): UpdateListingInput {
  if (!body || typeof body !== "object") {
    throw new AppError(400, "VALIDATION_ERROR", "Request body must be an object");
  }

  const requestBody = body as Record<string, unknown>;
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

export function validateListListingsQuery(query: unknown): ListListingsQuery {
  const safeQuery = query && typeof query === "object" ? (query as Record<string, unknown>) : {};
  const pagination = validatePaginationQuery(safeQuery);

  if (safeQuery.gameId === undefined) {
    return pagination;
  }

  return {
    ...pagination,
    gameId: validatePositiveIdParam(String(safeQuery.gameId)),
  };
}
