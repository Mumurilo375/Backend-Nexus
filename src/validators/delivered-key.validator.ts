import {
  readQueryParams,
  validatePaginationQuery,
  validatePositiveIdParam,
} from "../utils/request-validator";
import { InputValue } from "../utils/value-types";

export interface ListDeliveredKeysQuery {
  page: number;
  limit: number;
}

export function validateDeliveredKeyIdParam(id: string): number {
  return validatePositiveIdParam(id);
}

export function validateListDeliveredKeysQuery(
  query: InputValue | null | undefined,
): ListDeliveredKeysQuery {
  return validatePaginationQuery(readQueryParams(query));
}
