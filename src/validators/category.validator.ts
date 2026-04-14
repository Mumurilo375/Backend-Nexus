import { AppError } from "../utils/app-error";
import {
  readQueryParams,
  readRequestBody,
  validatePaginationQuery,
  validatePositiveIdParam,
} from "../utils/request-validator";
import { InputValue } from "../utils/value-types";

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

function readCategoryName(body: InputValue | null | undefined) {
  const name = String(readRequestBody(body).name ?? "").trim();

  if (!name) {
    throw new AppError(400, "VALIDATION_ERROR", "name is required");
  }

  if (name.length > 100) {
    throw new AppError(400, "VALIDATION_ERROR", "name must have at most 100 characters");
  }

  return name;
}

export function validateCreateCategoryInput(
  body: InputValue | null | undefined,
): CreateCategoryInput {
  return { name: readCategoryName(body) };
}

export function validateUpdateCategoryInput(
  body: InputValue | null | undefined,
): UpdateCategoryInput {
  return { name: readCategoryName(body) };
}

export function validateListCategoriesQuery(
  query: InputValue | null | undefined,
): ListCategoriesQuery {
  return validatePaginationQuery(readQueryParams(query));
}

export function validateIdParam(id: string): number {
  return validatePositiveIdParam(id);
}
