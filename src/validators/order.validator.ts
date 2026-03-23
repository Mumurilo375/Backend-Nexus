import { validatePaginationQuery, validatePositiveIdParam } from "../utils/request-validator";

export interface ListOrdersQuery {
  page: number;
  limit: number;
}

export function validateOrderIdParam(id: string): number {
  return validatePositiveIdParam(id);
}

export function validateListOrdersQuery(query: unknown): ListOrdersQuery {
  const safeQuery = query && typeof query === "object" ? (query as Record<string, unknown>) : {};
  return validatePaginationQuery(safeQuery);
}
