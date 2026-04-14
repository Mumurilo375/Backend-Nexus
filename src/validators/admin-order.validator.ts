import {
  readStrictQueryParams,
  validatePaginationQuery,
  validatePositiveIdParam,
} from "../utils/request-validator";
import { InputValue } from "../utils/value-types";

export interface ListAdminOrdersQuery {
  page: number;
  limit: number;
  q?: string;
  status?: string;
  paymentStatus?: string;
}

function readOptionalText(value: InputValue) {
  const text = String(value ?? "").trim();
  return text ? text : undefined;
}

export function validateAdminOrderIdParam(id: string) {
  return validatePositiveIdParam(id);
}

export function validateListAdminOrdersQuery(
  query: InputValue | null | undefined,
): ListAdminOrdersQuery {
  const safeQuery = readStrictQueryParams(query);
  const pagination = validatePaginationQuery(safeQuery);

  return {
    ...pagination,
    q: readOptionalText(safeQuery.q),
    status: readOptionalText(safeQuery.status),
    paymentStatus: readOptionalText(safeQuery.paymentStatus),
  };
}
