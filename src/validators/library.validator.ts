import { readQueryParams, validatePaginationQuery } from "../utils/request-validator";
import { InputValue } from "../utils/value-types";

export interface ListLibraryQuery {
  page: number;
  limit: number;
}

export function validateListLibraryQuery(query: InputValue | null | undefined): ListLibraryQuery {
  return validatePaginationQuery(readQueryParams(query));
}
