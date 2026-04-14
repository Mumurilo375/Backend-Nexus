import {
  readStrictQueryParams,
  validatePaginationQuery,
  validatePositiveIdParam,
} from "../utils/request-validator";
import { InputValue } from "../utils/value-types";

export interface ListListingPriceChangesQuery {
  page: number;
  limit: number;
  q?: string;
  listingId?: number;
}

function readOptionalText(value: InputValue) {
  const text = String(value ?? "").trim();
  return text ? text : undefined;
}

export function validateListListingPriceChangesQuery(
  query: InputValue | null | undefined,
): ListListingPriceChangesQuery {
  const safeQuery = readStrictQueryParams(query);
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
