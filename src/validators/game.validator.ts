import { AppError } from "../utils/app-error";
import {
  readQueryParams,
  readRequestBody,
  validatePaginationQuery,
  validatePositiveIdParam,
} from "../utils/request-validator";
import { InputObject, InputValue } from "../utils/value-types";

export interface GameGalleryItemInput {
  kind: "existing" | "file" | "url";
  id?: number;
  fileIndex?: number;
  url?: string;
}

export interface CreateGameInput {
  title: string;
  description: string;
  longDescription: string;
  releaseDate: string;
  coverImageUrl?: string;
  isActive: boolean;
  categoryIds: number[];
  galleryItems: GameGalleryItemInput[];
}

export interface UpdateGameInput {
  title?: string;
  description?: string;
  longDescription?: string;
  releaseDate?: string;
  coverImageUrl?: string;
  isActive?: boolean;
  categoryIds?: number[];
  galleryItems?: GameGalleryItemInput[];
}

export interface ListGamesQuery {
  page: number;
  limit: number;
  q?: string;
}

function requireString(value: InputValue, field: string) {
  const text = String(value ?? "").trim();
  if (!text) {
    throw new AppError(400, "VALIDATION_ERROR", `${field} is required`);
  }
  return text;
}

function readOptionalString(value: InputValue) {
  const text = String(value ?? "").trim();
  return text || undefined;
}

function validateDate(value: string, field: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      `${field} must be in YYYY-MM-DD format`,
    );
  }
  return value;
}

function parseBoolean(value: InputValue, field: string) {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  throw new AppError(400, "VALIDATION_ERROR", `${field} must be a boolean`);
}

function parseJsonArray(value: InputValue, field: string): InputValue[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (value === undefined || value === null || value === "") {
    return [];
  }

  try {
    const parsedValue = JSON.parse(String(value)) as InputValue;
    if (!Array.isArray(parsedValue)) {
      throw new Error("Not an array");
    }
    return parsedValue;
  } catch {
    throw new AppError(400, "VALIDATION_ERROR", `${field} must be a JSON array`);
  }
}

function parseCategoryIds(value: InputValue, required: boolean) {
  const parsedValues = parseJsonArray(value, "categoryIds");
  const uniqueCategoryIds = [
    ...new Set(parsedValues.map((item) => validatePositiveIdParam(String(item ?? "")))),
  ];

  if (required && uniqueCategoryIds.length === 0) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "categoryIds must contain at least one category",
    );
  }

  return uniqueCategoryIds;
}

function parseGalleryItems(value: InputValue) {
  const parsedValues = parseJsonArray(value, "galleryItems");

  return parsedValues.map((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new AppError(
        400,
        "VALIDATION_ERROR",
        `galleryItems[${index}] must be an object`,
      );
    }

    const candidate = item as InputObject;
    const kind = String(candidate.kind ?? "").trim() as GameGalleryItemInput["kind"];

    if (!["existing", "file", "url"].includes(kind)) {
      throw new AppError(
        400,
        "VALIDATION_ERROR",
        `galleryItems[${index}].kind is invalid`,
      );
    }

    if (kind === "existing") {
      return {
        kind,
        id: validatePositiveIdParam(String(candidate.id ?? "")),
      } satisfies GameGalleryItemInput;
    }

    if (kind === "file") {
      const fileIndex = Number(candidate.fileIndex);
      if (!Number.isInteger(fileIndex) || fileIndex < 0) {
        throw new AppError(
          400,
          "VALIDATION_ERROR",
          `galleryItems[${index}].fileIndex is invalid`,
        );
      }

      return {
        kind,
        fileIndex,
      } satisfies GameGalleryItemInput;
    }

    return {
      kind,
      url: requireString(candidate.url, `galleryItems[${index}].url`),
    } satisfies GameGalleryItemInput;
  });
}

export function validateCreateGameInput(
  body: InputValue | null | undefined,
): CreateGameInput {
  const requestBody = readRequestBody(body);

  return {
    title: requireString(requestBody.title, "title"),
    description: requireString(requestBody.description, "description"),
    longDescription: requireString(requestBody.longDescription, "longDescription"),
    releaseDate: validateDate(
      requireString(requestBody.releaseDate, "releaseDate"),
      "releaseDate",
    ),
    coverImageUrl: readOptionalString(requestBody.coverImageUrl),
    isActive:
      requestBody.isActive === undefined
        ? true
        : parseBoolean(requestBody.isActive, "isActive"),
    categoryIds: parseCategoryIds(requestBody.categoryIds, true),
    galleryItems: parseGalleryItems(requestBody.galleryItems),
  };
}

export function validateUpdateGameInput(
  body: InputValue | null | undefined,
): UpdateGameInput {
  const requestBody = readRequestBody(body);
  const result: UpdateGameInput = {};

  if (requestBody.title !== undefined) {
    result.title = requireString(requestBody.title, "title");
  }
  if (requestBody.description !== undefined) {
    result.description = requireString(requestBody.description, "description");
  }
  if (requestBody.longDescription !== undefined) {
    result.longDescription = requireString(
      requestBody.longDescription,
      "longDescription",
    );
  }
  if (requestBody.releaseDate !== undefined) {
    result.releaseDate = validateDate(
      requireString(requestBody.releaseDate, "releaseDate"),
      "releaseDate",
    );
  }
  if (requestBody.coverImageUrl !== undefined) {
    result.coverImageUrl = readOptionalString(requestBody.coverImageUrl);
  }
  if (requestBody.isActive !== undefined) {
    result.isActive = parseBoolean(requestBody.isActive, "isActive");
  }
  if (requestBody.categoryIds !== undefined) {
    result.categoryIds = parseCategoryIds(requestBody.categoryIds, true);
  }
  if (requestBody.galleryItems !== undefined) {
    result.galleryItems = parseGalleryItems(requestBody.galleryItems);
  }

  if (Object.keys(result).length === 0) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "At least one field must be provided",
    );
  }

  return result;
}

export function validateListGamesQuery(query: InputValue | null | undefined): ListGamesQuery {
  const safeQuery = readQueryParams(query);
  const pagination = validatePaginationQuery(safeQuery);
  const searchQuery = String(safeQuery.q ?? "").trim();

  if (!searchQuery) {
    return pagination;
  }

  return {
    ...pagination,
    q: searchQuery,
  };
}

export function validateIdParam(id: string) {
  return validatePositiveIdParam(id);
}
