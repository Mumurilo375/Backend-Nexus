import { AppError } from "../utils/app-error";
import { validatePaginationQuery, validatePositiveIdParam } from "../utils/request-validator";

export interface CreateGameImageInput {
  gameId: number;
  imageUrl: string;
  sortOrder?: number;
}

export interface UpdateGameImageInput {
  imageUrl?: string;
  sortOrder?: number;
}

export interface ListGameImagesQuery {
  page: number;
  limit: number;
  gameId?: number;
}

function requireString(value: unknown, field: string): string {
  const text = String(value ?? "").trim();
  if (!text) {
    throw new AppError(400, "VALIDATION_ERROR", `${field} is required`);
  }
  return text;
}

export function validateGameImageIdParam(id: string): number {
  return validatePositiveIdParam(id);
}

export function validateCreateGameImageInput(body: unknown): CreateGameImageInput {
  if (!body || typeof body !== "object") {
    throw new AppError(400, "VALIDATION_ERROR", "Request body must be an object");
  }

  const requestBody = body as Record<string, unknown>;

  const sortOrderValue = requestBody.sortOrder;
  const sortOrder = sortOrderValue === undefined ? 0 : Number(sortOrderValue);

  if (!Number.isInteger(sortOrder) || sortOrder < 0) {
    throw new AppError(400, "VALIDATION_ERROR", "sortOrder must be a positive integer");
  }

  return {
    gameId: validatePositiveIdParam(String(requestBody.gameId ?? "")),
    imageUrl: requireString(requestBody.imageUrl, "imageUrl"),
    sortOrder,
  };
}

export function validateUpdateGameImageInput(body: unknown): UpdateGameImageInput {
  if (!body || typeof body !== "object") {
    throw new AppError(400, "VALIDATION_ERROR", "Request body must be an object");
  }

  const requestBody = body as Record<string, unknown>;
  const result: UpdateGameImageInput = {};

  if (requestBody.imageUrl !== undefined) {
    result.imageUrl = requireString(requestBody.imageUrl, "imageUrl");
  }
  if (requestBody.sortOrder !== undefined) {
    const sortOrder = Number(requestBody.sortOrder);
    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      throw new AppError(400, "VALIDATION_ERROR", "sortOrder must be a positive integer");
    }
    result.sortOrder = sortOrder;
  }

  if (Object.keys(result).length === 0) {
    throw new AppError(400, "VALIDATION_ERROR", "At least one field must be provided");
  }

  return result;
}

export function validateListGameImagesQuery(query: unknown): ListGameImagesQuery {
  const safeQuery = query && typeof query === "object" ? (query as Record<string, unknown>) : {};
  const pagination = validatePaginationQuery(safeQuery);

  const gameIdValue = safeQuery.gameId;
  if (gameIdValue === undefined) {
    return pagination;
  }

  return {
    ...pagination,
    gameId: validatePositiveIdParam(String(gameIdValue)),
  };
}
