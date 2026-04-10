import { AppError } from "../utils/app-error";
import { validatePaginationQuery, validatePositiveIdParam } from "../utils/request-validator";

export interface ListListingPriceChangesQuery {
  page: number;
  limit: number;
  q?: string;
  listingId?: number;
}

function readOptionalText(value: unknown) {
  const text = String(value ?? "").trim();
  return text ? text : undefined;
}

export function validateListListingPriceChangesQuery(
  query: unknown,
): ListListingPriceChangesQuery {
  if (query !== undefined && typeof query !== "object") {
    throw new AppError(400, "VALIDATION_ERROR", "Query params must be an object");
  }

  const safeQuery = (query as Record<string, unknown> | undefined) ?? {};
  const pagination = validatePaginationQuery(safeQuery);

  return {
    ...pagination,
    q: readOptionalText(safeQuery.q),
    listingId:
      safeQuery.listingId === undefined
        ? undefined
        : validatePositiveIdParam(String(safeQuery.listingId)),
  };
}
