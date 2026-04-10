import { AppError } from "../utils/app-error";
import { validatePaginationQuery, validatePositiveIdParam } from "../utils/request-validator";

export interface ListAdminOrdersQuery {
  page: number;
  limit: number;
  q?: string;
  status?: string;
  paymentStatus?: string;
}

function readOptionalText(value: unknown) {
  const text = String(value ?? "").trim();
  return text ? text : undefined;
}

export function validateAdminOrderIdParam(id: string) {
  return validatePositiveIdParam(id);
}

export function validateListAdminOrdersQuery(query: unknown): ListAdminOrdersQuery {
  if (query !== undefined && typeof query !== "object") {
    throw new AppError(400, "VALIDATION_ERROR", "Query params must be an object");
  }

  const safeQuery = (query as Record<string, unknown> | undefined) ?? {};
  const pagination = validatePaginationQuery(safeQuery);

  return {
    ...pagination,
    q: readOptionalText(safeQuery.q),
    status: readOptionalText(safeQuery.status),
    paymentStatus: readOptionalText(safeQuery.paymentStatus),
  };
}
