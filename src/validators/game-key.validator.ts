import { AppError } from "../utils/app-error";
import { validatePaginationQuery, validatePositiveIdParam } from "../utils/request-validator";

export interface CreateGameKeyInput {
  listingId: number;
  keyValue: string;
}

export interface UpdateGameKeyInput {
  status: string;
}

export interface BulkCreateGameKeysInput {
  listingId: number;
  keyValues: string[];
}

export interface BulkDeleteGameKeysInput {
  listingId: number;
  ids: number[];
}

export interface ListGameKeysQuery {
  page: number;
  limit: number;
  listingId?: number;
}

function requireString(value: unknown, field: string): string {
  const text = String(value ?? "").trim();
  if (!text) {
    throw new AppError(400, "VALIDATION_ERROR", `${field} is required`);
  }
  return text;
}

function requireArray(value: unknown, field: string): unknown[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new AppError(400, "VALIDATION_ERROR", `${field} must be a non-empty array`);
  }

  return value;
}

export function validateGameKeyIdParam(id: string): number {
  return validatePositiveIdParam(id);
}

export function validateCreateGameKeyInput(body: unknown): CreateGameKeyInput {
  if (!body || typeof body !== "object") {
    throw new AppError(400, "VALIDATION_ERROR", "Request body must be an object");
  }

  const requestBody = body as Record<string, unknown>;

  return {
    listingId: validatePositiveIdParam(String(requestBody.listingId ?? "")),
    keyValue: requireString(requestBody.keyValue, "keyValue"),
  };
}

export function validateBulkCreateGameKeysInput(body: unknown): BulkCreateGameKeysInput {
  if (!body || typeof body !== "object") {
    throw new AppError(400, "VALIDATION_ERROR", "Request body must be an object");
  }

  const requestBody = body as Record<string, unknown>;

  return {
    listingId: validatePositiveIdParam(String(requestBody.listingId ?? "")),
    keyValues: requireArray(requestBody.keyValues, "keyValues").map((value) =>
      String(value ?? ""),
    ),
  };
}

export function validateBulkDeleteGameKeysInput(body: unknown): BulkDeleteGameKeysInput {
  if (!body || typeof body !== "object") {
    throw new AppError(400, "VALIDATION_ERROR", "Request body must be an object");
  }

  const requestBody = body as Record<string, unknown>;

  return {
    listingId: validatePositiveIdParam(String(requestBody.listingId ?? "")),
    ids: requireArray(requestBody.ids, "ids").map((value) =>
      validatePositiveIdParam(String(value ?? "")),
    ),
  };
}

export function validateUpdateGameKeyInput(body: unknown): UpdateGameKeyInput {
  if (!body || typeof body !== "object") {
    throw new AppError(400, "VALIDATION_ERROR", "Request body must be an object");
  }

  const requestBody = body as Record<string, unknown>;
  const status = requireString(requestBody.status, "status");

  if (![
    "available",
    "reserved",
    "sold",
  ].includes(status)) {
    throw new AppError(400, "VALIDATION_ERROR", "status must be available, reserved or sold");
  }

  return { status };
}

export function validateListGameKeysQuery(query: unknown): ListGameKeysQuery {
  const safeQuery = query && typeof query === "object" ? (query as Record<string, unknown>) : {};
  const pagination = validatePaginationQuery(safeQuery);

  const listingIdValue = safeQuery.listingId;
  if (listingIdValue === undefined) {
    return pagination;
  }

  return {
    ...pagination,
    listingId: validatePositiveIdParam(String(listingIdValue)),
  };
}
