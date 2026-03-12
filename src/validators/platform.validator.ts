import { AppError } from "../utils/app-error";

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

export function validateCreatePlatformInput(body: Record<string, unknown>): CreatePlatformInput {
  if (!body || typeof body !== "object") {
    throw new AppError(400, "VALIDATION_ERROR", "Request body must be an object");
  }

  const name = requireString(body.name, "name");
  const slug = requireString(body.slug, "slug");

  if (name.length > 100) {
    throw new AppError(400, "VALIDATION_ERROR", "name must have at most 100 characters");
  }
  if (slug.length > 100) {
    throw new AppError(400, "VALIDATION_ERROR", "slug must have at most 100 characters");
  }

  return {
    name,
    slug,
    iconUrl: body.iconUrl ? String(body.iconUrl) : null,
  };
}

export function validateUpdatePlatformInput(body: Record<string, unknown>): UpdatePlatformInput {
  if (!body || typeof body !== "object") {
    throw new AppError(400, "VALIDATION_ERROR", "Request body must be an object");
  }

  const result: UpdatePlatformInput = {};

  if (body.name !== undefined) {
    result.name = requireString(body.name, "name");
    if (result.name.length > 100) {
      throw new AppError(400, "VALIDATION_ERROR", "name must have at most 100 characters");
    }
  }
  if (body.slug !== undefined) {
    result.slug = requireString(body.slug, "slug");
    if (result.slug.length > 100) {
      throw new AppError(400, "VALIDATION_ERROR", "slug must have at most 100 characters");
    }
  }
  if (body.iconUrl !== undefined) {
    result.iconUrl = body.iconUrl ? String(body.iconUrl) : null;
  }
  if (body.isActive !== undefined) {
    if (typeof body.isActive !== "boolean") {
      throw new AppError(400, "VALIDATION_ERROR", "isActive must be a boolean");
    }
    result.isActive = body.isActive;
  }

  if (Object.keys(result).length === 0) {
    throw new AppError(400, "VALIDATION_ERROR", "At least one field must be provided");
  }

  return result;
}

export function validateListPlatformsQuery(query: Record<string, unknown>): ListPlatformsQuery {
  const page = Number(query?.page) || 1;
  const limit = Number(query?.limit) || 20;

  return {
    page: page > 0 ? page : 1,
    limit: limit > 0 && limit <= 100 ? limit : 20,
  };
}

export function validateIdParam(id: string): number {
  const num = Number(id);
  if (!Number.isInteger(num) || num <= 0) {
    throw new AppError(400, "VALIDATION_ERROR", "id must be a positive integer");
  }
  return num;
}
