import { AppError } from "../utils/app-error";

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

export function validateCreateGameInput(body: Record<string, unknown>): CreateGameInput {
  if (!body || typeof body !== "object") {
    throw new AppError(400, "VALIDATION_ERROR", "Request body must be an object");
  }

  const title = requireString(body.title, "title");
  const description = requireString(body.description, "description");
  const longDescription = requireString(body.longDescription, "longDescription");
  const releaseDate = validateDate(requireString(body.releaseDate, "releaseDate"), "releaseDate");
  const coverImageUrl = requireString(body.coverImageUrl, "coverImageUrl");

  return { title, description, longDescription, releaseDate, coverImageUrl };
}

export function validateUpdateGameInput(body: Record<string, unknown>): UpdateGameInput {
  if (!body || typeof body !== "object") {
    throw new AppError(400, "VALIDATION_ERROR", "Request body must be an object");
  }

  const result: UpdateGameInput = {};

  if (body.title !== undefined) {
    result.title = requireString(body.title, "title");
  }
  if (body.description !== undefined) {
    result.description = requireString(body.description, "description");
  }
  if (body.longDescription !== undefined) {
    result.longDescription = requireString(body.longDescription, "longDescription");
  }
  if (body.releaseDate !== undefined) {
    result.releaseDate = validateDate(requireString(body.releaseDate, "releaseDate"), "releaseDate");
  }
  if (body.coverImageUrl !== undefined) {
    result.coverImageUrl = requireString(body.coverImageUrl, "coverImageUrl");
  }
  if (body.isActive !== undefined) {
    if (typeof body.isActive !== "boolean") {
      throw new AppError(400, "VALIDATION_ERROR", "isActive must be a boolean");
    }
    result.isActive = body.isActive;
  }

  if (Object.keys(result).length === 0) {
    throw new AppError(400, "VALIDATION_ERROR", "At least one field must be provided");
  }

  return result;
}

export function validateListGamesQuery(query: Record<string, unknown>): ListGamesQuery {
  const page = Number(query?.page) || 1;
  const limit = Number(query?.limit) || 20;

  return {
    page: page > 0 ? page : 1,
    limit: limit > 0 && limit <= 100 ? limit : 20,
  };
}

export function validateIdParam(id: string): number {
  const num = Number(id);
  if (!Number.isInteger(num) || num <= 0) {
    throw new AppError(400, "VALIDATION_ERROR", "id must be a positive integer");
  }
  return num;
}
