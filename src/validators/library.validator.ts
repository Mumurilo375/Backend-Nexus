import { validatePaginationQuery } from "../utils/request-validator";

export interface ListLibraryQuery {
  page: number;
  limit: number;
}

export function validateListLibraryQuery(query: unknown): ListLibraryQuery {
  const safeQuery = query && typeof query === "object" ? (query as Record<string, unknown>) : {};
  return validatePaginationQuery(safeQuery);
}
