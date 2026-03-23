import { validatePaginationQuery, validatePositiveIdParam } from "../utils/request-validator";

export interface ListOrderItemsQuery {
  page: number;
  limit: number;
}

export function validateOrderItemIdParam(id: string): number {
  return validatePositiveIdParam(id);
}

export function validateListOrderItemsQuery(query: unknown): ListOrderItemsQuery {
  const safeQuery = query && typeof query === "object" ? (query as Record<string, unknown>) : {};
  return validatePaginationQuery(safeQuery);
}
