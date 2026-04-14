import { AppError } from "../utils/app-error";
import {
  readQueryParams,
  readRequestBody,
  validatePaginationQuery,
  validatePositiveIdParam,
} from "../utils/request-validator";
import { InputValue } from "../utils/value-types";

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

function requireString(value: InputValue, field: string): string {
  const text = String(value ?? "").trim();
  if (!text) {
    throw new AppError(400, "VALIDATION_ERROR", `${field} is required`);
  }
  return text;
}

function requireArray(value: InputValue, field: string): InputValue[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new AppError(400, "VALIDATION_ERROR", `${field} must be a non-empty array`);
  }

  return value;
}

export function validateGameKeyIdParam(id: string): number {
  return validatePositiveIdParam(id);
}

export function validateCreateGameKeyInput(
  body: InputValue | null | undefined,
): CreateGameKeyInput {
  const requestBody = readRequestBody(body);

  return {
    listingId: validatePositiveIdParam(String(requestBody.listingId ?? "")),
    keyValue: requireString(requestBody.keyValue, "keyValue"),
  };
}

export function validateBulkCreateGameKeysInput(
  body: InputValue | null | undefined,
): BulkCreateGameKeysInput {
  const requestBody = readRequestBody(body);

  return {
    listingId: validatePositiveIdParam(String(requestBody.listingId ?? "")),
    keyValues: requireArray(requestBody.keyValues, "keyValues").map((value) =>
      String(value ?? ""),
    ),
  };
}

export function validateBulkDeleteGameKeysInput(
  body: InputValue | null | undefined,
): BulkDeleteGameKeysInput {
  const requestBody = readRequestBody(body);

  return {
    listingId: validatePositiveIdParam(String(requestBody.listingId ?? "")),
    ids: requireArray(requestBody.ids, "ids").map((value) =>
      validatePositiveIdParam(String(value ?? "")),
    ),
  };
}

export function validateUpdateGameKeyInput(
  body: InputValue | null | undefined,
): UpdateGameKeyInput {
  const status = requireString(readRequestBody(body).status, "status");

  if (!["available", "reserved", "sold"].includes(status)) {
    throw new AppError(400, "VALIDATION_ERROR", "status must be available, reserved or sold");
  }

  return { status };
}

export function validateListGameKeysQuery(
  query: InputValue | null | undefined,
): ListGameKeysQuery {
  const safeQuery = readQueryParams(query);
  const pagination = validatePaginationQuery(safeQuery);

  if (safeQuery.listingId === undefined) {
    return pagination;
  }

  return {
    ...pagination,
    listingId: validatePositiveIdParam(String(safeQuery.listingId)),
  };
}
