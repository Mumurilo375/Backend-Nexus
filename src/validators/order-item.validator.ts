import {
  readQueryParams,
  validatePaginationQuery,
  validatePositiveIdParam,
} from "../utils/request-validator";
import { InputValue } from "../utils/value-types";

export interface ListOrderItemsQuery {
  page: number;
  limit: number;
}

export function validateOrderItemIdParam(id: string): number {
  return validatePositiveIdParam(id);
}

export function validateListOrderItemsQuery(
  query: InputValue | null | undefined,
): ListOrderItemsQuery {
  return validatePaginationQuery(readQueryParams(query));
}
