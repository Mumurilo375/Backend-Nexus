import { AppError } from "./app-error";

export interface PaginationQuery {
  page: number;
  limit: number;
}

export function validatePaginationQuery(query: Record<string, unknown>): PaginationQuery {
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