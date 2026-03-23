import { validatePaginationQuery, validatePositiveIdParam } from "../utils/request-validator";

export interface ListDeliveredKeysQuery {
  page: number;
  limit: number;
}

export function validateDeliveredKeyIdParam(id: string): number {
  return validatePositiveIdParam(id);
}

export function validateListDeliveredKeysQuery(query: unknown): ListDeliveredKeysQuery {
  const safeQuery = query && typeof query === "object" ? (query as Record<string, unknown>) : {};
  return validatePaginationQuery(safeQuery);
}
