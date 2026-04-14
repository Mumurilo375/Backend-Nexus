import {
  readQueryParams,
  validatePaginationQuery,
  validatePositiveIdParam,
} from "../utils/request-validator";
import { InputValue } from "../utils/value-types";

export interface ListOrdersQuery {
  page: number;
  limit: number;
}

export function validateOrderIdParam(id: string): number {
  return validatePositiveIdParam(id);
}

export function validateListOrdersQuery(query: InputValue | null | undefined): ListOrdersQuery {
  return validatePaginationQuery(readQueryParams(query));
}
