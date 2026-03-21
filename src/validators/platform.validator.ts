import { AppError } from "../utils/app-error";
import { validatePaginationQuery, validatePositiveIdParam } from "../utils/request-validator";

export interface CreatePlatformInput {
  name: string;
  slug: string;
  iconUrl?: string | null;
}

export interface UpdatePlatformInput {
  name?: string;
  slug?: string;
  iconUrl?: string | null;
  isActive?: boolean;
}

export interface ListPlatformsQuery {
  page: number;
  limit: number;
}

function requireString(value: unknown, field: string): string {
  const str = String(value ?? "").trim();
  if (!str) {
    throw new AppError(400, "VALIDATION_ERROR", `${field} is required`);
  }
  return str;
}

export function validateCreatePlatformInput(body: unknown): CreatePlatformInput {
  if (!body || typeof body !== "object") {
    throw new AppError(400, "VALIDATION_ERROR", "Request body must be an object");
  }

  const requestBody = body as Record<string, unknown>;

  const name = requireString(requestBody.name, "name");
  const slug = requireString(requestBody.slug, "slug");

  if (name.length > 100) {
    throw new AppError(400, "VALIDATION_ERROR", "name must have at most 100 characters");
  }
  if (slug.length > 100) {
    throw new AppError(400, "VALIDATION_ERROR", "slug must have at most 100 characters");
  }

  return {
    name,
    slug,
    iconUrl: requestBody.iconUrl ? String(requestBody.iconUrl) : null,
  };
}

export function validateUpdatePlatformInput(body: unknown): UpdatePlatformInput {
  if (!body || typeof body !== "object") {
    throw new AppError(400, "VALIDATION_ERROR", "Request body must be an object");
  }

  const requestBody = body as Record<string, unknown>;

  const result: UpdatePlatformInput = {};

  if (requestBody.name !== undefined) {
    result.name = requireString(requestBody.name, "name");
    if (result.name.length > 100) {
      throw new AppError(400, "VALIDATION_ERROR", "name must have at most 100 characters");
    }
  }
  if (requestBody.slug !== undefined) {
    result.slug = requireString(requestBody.slug, "slug");
    if (result.slug.length > 100) {
      throw new AppError(400, "VALIDATION_ERROR", "slug must have at most 100 characters");
    }
  }
  if (requestBody.iconUrl !== undefined) {
    result.iconUrl = requestBody.iconUrl ? String(requestBody.iconUrl) : null;
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

export function validateListPlatformsQuery(query: unknown): ListPlatformsQuery {
  const safeQuery = query && typeof query === "object" ? (query as Record<string, unknown>) : {};
  return validatePaginationQuery(safeQuery);
}

export function validateIdParam(id: string): number {
  return validatePositiveIdParam(id);
}
