import { AppError } from "../utils/app-error";
import {
  readQueryParams,
  readRequestBody,
  validatePaginationQuery,
  validatePositiveIdParam,
} from "../utils/request-validator";
import { InputValue } from "../utils/value-types";

export interface CreatePromotionInput {
  name: string;
  description?: string | null;
  coverImageUrl?: string | null;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

export interface UpdatePromotionInput {
  name?: string;
  description?: string | null;
  coverImageUrl?: string | null;
  discountPercentage?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface ListPromotionsQuery {
  page: number;
  limit: number;
  activeNow?: boolean;
}

function requireString(value: InputValue, field: string): string {
  const text = String(value ?? "").trim();
  if (!text) {
    throw new AppError(400, "VALIDATION_ERROR", `${field} is required`);
  }
  return text;
}

function validatePercentage(value: InputValue): number {
  const discount = Number(value);
  if (!Number.isInteger(discount) || discount < 1 || discount > 100) {
    throw new AppError(400, "VALIDATION_ERROR", "discountPercentage must be between 1 and 100");
  }
  return discount;
}

function validateDate(value: InputValue, field: string): string {
  const date = String(value ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}/.test(date)) {
    throw new AppError(400, "VALIDATION_ERROR", `${field} must be a valid date string`);
  }
  return date;
}

function validateBooleanQuery(value: InputValue, fieldName: string): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  const normalizedValue = String(value ?? "").trim().toLowerCase();

  if (normalizedValue === "true" || normalizedValue === "1") {
    return true;
  }

  if (normalizedValue === "false" || normalizedValue === "0") {
    return false;
  }

  throw new AppError(400, "VALIDATION_ERROR", `${fieldName} must be a boolean`);
}

function parseBooleanInput(value: InputValue, fieldName: string): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  const normalizedValue = String(value ?? "").trim().toLowerCase();

  if (normalizedValue === "true" || normalizedValue === "1") {
    return true;
  }

  if (normalizedValue === "false" || normalizedValue === "0") {
    return false;
  }

  throw new AppError(400, "VALIDATION_ERROR", `${fieldName} must be a boolean`);
}

function parseOptionalText(value: InputValue) {
  if (value === undefined || value === null) {
    return null;
  }

  const text = String(value).trim();
  return text ? text : null;
}

export function validatePromotionIdParam(id: string): number {
  return validatePositiveIdParam(id);
}

export function validateCreatePromotionInput(
  body: InputValue | null | undefined,
): CreatePromotionInput {
  const requestBody = readRequestBody(body);

  return {
    name: requireString(requestBody.name, "name"),
    description: parseOptionalText(requestBody.description),
    coverImageUrl: parseOptionalText(requestBody.coverImageUrl),
    discountPercentage: validatePercentage(requestBody.discountPercentage),
    startDate: validateDate(requestBody.startDate, "startDate"),
    endDate: validateDate(requestBody.endDate, "endDate"),
    isActive:
      requestBody.isActive === undefined
        ? true
        : parseBooleanInput(requestBody.isActive, "isActive"),
  };
}

export function validateUpdatePromotionInput(
  body: InputValue | null | undefined,
): UpdatePromotionInput {
  const requestBody = readRequestBody(body);
  const result: UpdatePromotionInput = {};

  if (requestBody.name !== undefined) {
    result.name = requireString(requestBody.name, "name");
  }
  if (requestBody.description !== undefined) {
    result.description = parseOptionalText(requestBody.description);
  }
  if (requestBody.coverImageUrl !== undefined) {
    result.coverImageUrl = parseOptionalText(requestBody.coverImageUrl);
  }
  if (requestBody.discountPercentage !== undefined) {
    result.discountPercentage = validatePercentage(requestBody.discountPercentage);
  }
  if (requestBody.startDate !== undefined) {
    result.startDate = validateDate(requestBody.startDate, "startDate");
  }
  if (requestBody.endDate !== undefined) {
    result.endDate = validateDate(requestBody.endDate, "endDate");
  }
  if (requestBody.isActive !== undefined) {
    result.isActive = parseBooleanInput(requestBody.isActive, "isActive");
  }

  if (Object.keys(result).length === 0) {
    throw new AppError(400, "VALIDATION_ERROR", "At least one field must be provided");
  }

  return result;
}

export function validateListPromotionsQuery(
  query: InputValue | null | undefined,
): ListPromotionsQuery {
  const safeQuery = readQueryParams(query);

  return {
    ...validatePaginationQuery(safeQuery),
    activeNow:
      safeQuery.activeNow === undefined
        ? undefined
        : validateBooleanQuery(safeQuery.activeNow, "activeNow"),
  };
}
