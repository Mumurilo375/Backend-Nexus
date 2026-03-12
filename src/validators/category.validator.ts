import { AppError } from "../utils/app-error";

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

export function validateCreateCategoryInput(body: Record<string, unknown>): CreateCategoryInput {
  if (!body || typeof body !== "object") {
    throw new AppError(400, "VALIDATION_ERROR", "Request body must be an object");
  }

  const name = String(body.name ?? "").trim();
  if (!name) {
    throw new AppError(400, "VALIDATION_ERROR", "name is required");
  }
  if (name.length > 100) {
    throw new AppError(400, "VALIDATION_ERROR", "name must have at most 100 characters");
  }

  return { name };
}

export function validateUpdateCategoryInput(body: Record<string, unknown>): UpdateCategoryInput {
  if (!body || typeof body !== "object") {
    throw new AppError(400, "VALIDATION_ERROR", "Request body must be an object");
  }

  const name = String(body.name ?? "").trim();
  if (!name) {
    throw new AppError(400, "VALIDATION_ERROR", "name is required");
  }
  if (name.length > 100) {
    throw new AppError(400, "VALIDATION_ERROR", "name must have at most 100 characters");
  }

  return { name };
}

export function validateListCategoriesQuery(query: Record<string, unknown>): ListCategoriesQuery {
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
