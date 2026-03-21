import { AppError } from "../utils/app-error";
import { validatePaginationQuery, validatePositiveIdParam } from "../utils/request-validator";

export interface CreateCategoryInput {
  name: string;
}

export interface UpdateCategoryInput {
  name: string;
}

export interface ListCategoriesQuery {
  page: number;
  limit: number;
}

export function validateCreateCategoryInput(body: unknown): CreateCategoryInput {
  if (!body || typeof body !== "object") {
    throw new AppError(400, "VALIDATION_ERROR", "Request body must be an object");
  }

  const requestBody = body as Record<string, unknown>;

  const name = String(requestBody.name ?? "").trim();
  if (!name) {
    throw new AppError(400, "VALIDATION_ERROR", "name is required");
  }
  if (name.length > 100) {
    throw new AppError(400, "VALIDATION_ERROR", "name must have at most 100 characters");
  }

  return { name };
}

export function validateUpdateCategoryInput(body: unknown): UpdateCategoryInput {
  if (!body || typeof body !== "object") {
    throw new AppError(400, "VALIDATION_ERROR", "Request body must be an object");
  }

  const requestBody = body as Record<string, unknown>;

  const name = String(requestBody.name ?? "").trim();
  if (!name) {
    throw new AppError(400, "VALIDATION_ERROR", "name is required");
  }
  if (name.length > 100) {
    throw new AppError(400, "VALIDATION_ERROR", "name must have at most 100 characters");
  }

  return { name };
}

export function validateListCategoriesQuery(query: unknown): ListCategoriesQuery {
  const safeQuery = query && typeof query === "object" ? (query as Record<string, unknown>) : {};
  return validatePaginationQuery(safeQuery);
}

export function validateIdParam(id: string): number {
  return validatePositiveIdParam(id);
}
