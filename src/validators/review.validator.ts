import { AppError } from "../utils/app-error";
import { validatePaginationQuery, validatePositiveIdParam } from "../utils/request-validator";

export interface CreateReviewInput {
  gameId: number;
  rating: number;
  comment: string;
}

export interface UpdateReviewInput {
  rating: number;
  comment: string;
}

export interface ListReviewsQuery {
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

function validateRating(value: unknown): number {
  const rating = Number(value);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new AppError(400, "VALIDATION_ERROR", "rating must be an integer from 1 to 5");
  }
  return rating;
}

export function validateReviewIdParam(id: string): number {
  return validatePositiveIdParam(id);
}

export function validateCreateReviewInput(body: unknown): CreateReviewInput {
  if (!body || typeof body !== "object") {
    throw new AppError(400, "VALIDATION_ERROR", "Request body must be an object");
  }

  const requestBody = body as Record<string, unknown>;

  return {
    gameId: validatePositiveIdParam(String(requestBody.gameId ?? "")),
    rating: validateRating(requestBody.rating),
    comment: requireString(requestBody.comment, "comment"),
  };
}

export function validateUpdateReviewInput(body: unknown): UpdateReviewInput {
  if (!body || typeof body !== "object") {
    throw new AppError(400, "VALIDATION_ERROR", "Request body must be an object");
  }

  const requestBody = body as Record<string, unknown>;

  return {
    rating: validateRating(requestBody.rating),
    comment: requireString(requestBody.comment, "comment"),
  };
}

export function validateListReviewsQuery(query: unknown): ListReviewsQuery {
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
