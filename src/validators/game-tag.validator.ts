import { AppError } from "../utils/app-error";
import { validatePaginationQuery, validatePositiveIdParam } from "../utils/request-validator";

export interface CreateGameTagInput {
  gameId: number;
  tagId: number;
}

export interface ListGameTagsQuery {
  page: number;
  limit: number;
  gameId?: number;
}

export interface GameTagParams {
  gameId: number;
  tagId: number;
}

export function validateCreateGameTagInput(body: unknown): CreateGameTagInput {
  if (!body || typeof body !== "object") {
    throw new AppError(400, "VALIDATION_ERROR", "Request body must be an object");
  }

  const requestBody = body as Record<string, unknown>;

  return {
    gameId: validatePositiveIdParam(String(requestBody.gameId ?? "")),
    tagId: validatePositiveIdParam(String(requestBody.tagId ?? "")),
  };
}

export function validateGameTagParams(gameId: string, tagId: string): GameTagParams {
  return {
    gameId: validatePositiveIdParam(gameId),
    tagId: validatePositiveIdParam(tagId),
  };
}

export function validateListGameTagsQuery(query: unknown): ListGameTagsQuery {
  const safeQuery = query && typeof query === "object" ? (query as Record<string, unknown>) : {};
  const pagination = validatePaginationQuery(safeQuery);

  const gameIdValue = safeQuery.gameId;
  if (gameIdValue === undefined) {
    return pagination;
  }

  return {
    ...pagination,
    gameId: validatePositiveIdParam(String(gameIdValue)),
  };
}
