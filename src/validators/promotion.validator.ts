import { AppError } from "../utils/app-error";
import { validatePaginationQuery, validatePositiveIdParam } from "../utils/request-validator";

export interface CreatePromotionInput {
  name: string;
  description?: string | null;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

export interface UpdatePromotionInput {
  name?: string;
  description?: string | null;
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

function requireString(value: unknown, field: string): string {
  const text = String(value ?? "").trim();
  if (!text) {
    throw new AppError(400, "VALIDATION_ERROR", `${field} is required`);
  }
  return text;
}

function validatePercentage(value: unknown): number {
  const discount = Number(value);
  if (!Number.isInteger(discount) || discount < 1 || discount > 100) {
    throw new AppError(400, "VALIDATION_ERROR", "discountPercentage must be between 1 and 100");
  }
  return discount;
}

function validateDate(value: unknown, field: string): string {
  const date = String(value ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}/.test(date)) {
    throw new AppError(400, "VALIDATION_ERROR", `${field} must be a valid date string`);
  }
  return date;
}

export function validatePromotionIdParam(id: string): number {
  return validatePositiveIdParam(id);
}

export function validateCreatePromotionInput(body: unknown): CreatePromotionInput {
  if (!body || typeof body !== "object") {
    throw new AppError(400, "VALIDATION_ERROR", "Request body must be an object");
  }

  const requestBody = body as Record<string, unknown>;

  return {
    name: requireString(requestBody.name, "name"),
    description: requestBody.description ? String(requestBody.description) : null,
    discountPercentage: validatePercentage(requestBody.discountPercentage),
    startDate: validateDate(requestBody.startDate, "startDate"),
    endDate: validateDate(requestBody.endDate, "endDate"),
    isActive: requestBody.isActive === undefined ? true : Boolean(requestBody.isActive),
  };
}

export function validateUpdatePromotionInput(body: unknown): UpdatePromotionInput {
  if (!body || typeof body !== "object") {
    throw new AppError(400, "VALIDATION_ERROR", "Request body must be an object");
  }

  const requestBody = body as Record<string, unknown>;
  const result: UpdatePromotionInput = {};

  if (requestBody.name !== undefined) {
    result.name = requireString(requestBody.name, "name");
  }
  if (requestBody.description !== undefined) {
    result.description = requestBody.description ? String(requestBody.description) : null;
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
    if (typeof requestBody.isActive !== "boolean") {
      throw new AppError(400, "VALIDATION_ERROR", "isActive must be a boolean");
    }
    result.isActive = requestBody.isActive;
  }

  if (Object.keys(result).length === 0) {
    throw new AppError(400, "VALIDATION_ERROR", "At least one field must be provided");
  }

  return result;
}

export function validateListPromotionsQuery(query: unknown): ListPromotionsQuery {
  const safeQuery = query && typeof query === "object" ? (query as Record<string, unknown>) : {};
  return {
    ...validatePaginationQuery(safeQuery),
    activeNow:
      safeQuery.activeNow === undefined
        ? undefined
        : validateBooleanQuery(safeQuery.activeNow, "activeNow"),
  };
}
function validateBooleanQuery(value: unknown, fieldName: string): boolean {
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
