import { AppError } from "../utils/app-error";
import { validatePaginationQuery, validatePositiveIdParam } from "../utils/request-validator";

export interface CreateGameInput {
  title: string;
  description: string;
  longDescription: string;
  releaseDate: string;
  coverImageUrl: string;
}

export interface UpdateGameInput {
  title?: string;
  description?: string;
  longDescription?: string;
  releaseDate?: string;
  coverImageUrl?: string;
  isActive?: boolean;
}

export interface ListGamesQuery {
  page: number;
  limit: number;
}

function requireString(value: unknown, field: string): string {
  const str = String(value ?? "").trim();
  if (!str) {
    throw new AppError(400, "VALIDATION_ERROR", `${field} is required`);
  }
  return str;
}

function validateDate(value: string, field: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new AppError(400, "VALIDATION_ERROR", `${field} must be in YYYY-MM-DD format`);
  }
  return value;
}

export function validateCreateGameInput(body: unknown): CreateGameInput {
  if (!body || typeof body !== "object") {
    throw new AppError(400, "VALIDATION_ERROR", "Request body must be an object");
  }

  const requestBody = body as Record<string, unknown>;

  const title = requireString(requestBody.title, "title");
  const description = requireString(requestBody.description, "description");
  const longDescription = requireString(requestBody.longDescription, "longDescription");
  const releaseDate = validateDate(requireString(requestBody.releaseDate, "releaseDate"), "releaseDate");
  const coverImageUrl = requireString(requestBody.coverImageUrl, "coverImageUrl");

  return { title, description, longDescription, releaseDate, coverImageUrl };
}

export function validateUpdateGameInput(body: unknown): UpdateGameInput {
  if (!body || typeof body !== "object") {
    throw new AppError(400, "VALIDATION_ERROR", "Request body must be an object");
  }

  const requestBody = body as Record<string, unknown>;

  const result: UpdateGameInput = {};

  if (requestBody.title !== undefined) {
    result.title = requireString(requestBody.title, "title");
  }
  if (requestBody.description !== undefined) {
    result.description = requireString(requestBody.description, "description");
  }
  if (requestBody.longDescription !== undefined) {
    result.longDescription = requireString(requestBody.longDescription, "longDescription");
  }
  if (requestBody.releaseDate !== undefined) {
    result.releaseDate = validateDate(requireString(requestBody.releaseDate, "releaseDate"), "releaseDate");
  }
  if (requestBody.coverImageUrl !== undefined) {
    result.coverImageUrl = requireString(requestBody.coverImageUrl, "coverImageUrl");
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

export function validateListGamesQuery(query: unknown): ListGamesQuery {
  const safeQuery = query && typeof query === "object" ? (query as Record<string, unknown>) : {};
  return validatePaginationQuery(safeQuery);
}

export function validateIdParam(id: string): number {
  return validatePositiveIdParam(id);
}
