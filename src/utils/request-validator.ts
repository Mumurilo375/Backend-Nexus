import { AppError } from "./app-error";
import { InputObject, InputValue } from "./value-types";

export interface PaginationQuery {
  page: number;
  limit: number;
}

export function isInputObject(value: InputValue | null | undefined): value is InputObject {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function readRequestBody(body: InputValue | null | undefined): InputObject {
  if (!isInputObject(body)) {
    throw new AppError(400, "VALIDATION_ERROR", "Request body must be an object");
  }

  return body;
}

export function readQueryParams(query: InputValue | null | undefined): InputObject {
  return isInputObject(query) ? query : {};
}

export function readStrictQueryParams(query: InputValue | null | undefined): InputObject {
  if (query === undefined) {
    return {};
  }

  if (!isInputObject(query)) {
    throw new AppError(400, "VALIDATION_ERROR", "Query params must be an object");
  }

  return query;
}

export function validatePaginationQuery(query: InputObject): PaginationQuery {
  const page = Number(query?.page) || 1;
  const limit = Number(query?.limit) || 20;

  return {
    page: page > 0 ? page : 1,
    limit: limit > 0 && limit <= 100 ? limit : 20,
  };
}

export function validatePositiveIdParam(id: string): number {
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new AppError(400, "VALIDATION_ERROR", "id must be a positive integer");
  }

  return numericId;
}
