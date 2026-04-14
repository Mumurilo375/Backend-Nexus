import { AppError } from "../utils/app-error";
import {
  readQueryParams,
  readRequestBody,
  validatePaginationQuery,
  validatePositiveIdParam,
} from "../utils/request-validator";
import { InputValue } from "../utils/value-types";

export interface CreateGameImageInput {
  gameId: number;
  imageUrl: string;
  sortOrder?: number;
}

export interface UpdateGameImageInput {
  imageUrl?: string;
  sortOrder?: number;
}

export interface ListGameImagesQuery {
  page: number;
  limit: number;
  gameId?: number;
}

function requireString(value: InputValue, field: string): string {
  const text = String(value ?? "").trim();
  if (!text) {
    throw new AppError(400, "VALIDATION_ERROR", `${field} is required`);
  }
  return text;
}

export function validateGameImageIdParam(id: string): number {
  return validatePositiveIdParam(id);
}

export function validateCreateGameImageInput(
  body: InputValue | null | undefined,
): CreateGameImageInput {
  const requestBody = readRequestBody(body);
  const sortOrderValue = requestBody.sortOrder;
  const sortOrder = sortOrderValue === undefined ? 0 : Number(sortOrderValue);

  if (!Number.isInteger(sortOrder) || sortOrder < 0) {
    throw new AppError(400, "VALIDATION_ERROR", "sortOrder must be a positive integer");
  }

  return {
    gameId: validatePositiveIdParam(String(requestBody.gameId ?? "")),
    imageUrl: requireString(requestBody.imageUrl, "imageUrl"),
    sortOrder,
  };
}

export function validateUpdateGameImageInput(
  body: InputValue | null | undefined,
): UpdateGameImageInput {
  const requestBody = readRequestBody(body);
  const result: UpdateGameImageInput = {};

  if (requestBody.imageUrl !== undefined) {
    result.imageUrl = requireString(requestBody.imageUrl, "imageUrl");
  }

  if (requestBody.sortOrder !== undefined) {
    const sortOrder = Number(requestBody.sortOrder);
    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      throw new AppError(400, "VALIDATION_ERROR", "sortOrder must be a positive integer");
    }
    result.sortOrder = sortOrder;
  }

  if (Object.keys(result).length === 0) {
    throw new AppError(400, "VALIDATION_ERROR", "At least one field must be provided");
  }

  return result;
}

export function validateListGameImagesQuery(
  query: InputValue | null | undefined,
): ListGameImagesQuery {
  const safeQuery = readQueryParams(query);
  const pagination = validatePaginationQuery(safeQuery);

  if (safeQuery.gameId === undefined) {
    return pagination;
  }

  return {
    ...pagination,
    gameId: validatePositiveIdParam(String(safeQuery.gameId)),
  };
}
