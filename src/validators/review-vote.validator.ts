import { validatePaginationQuery, validatePositiveIdParam } from "../utils/request-validator";

export interface ListReviewVotesQuery {
  page: number;
  limit: number;
  reviewId?: number;
}

export function validateReviewIdParam(id: string): number {
  return validatePositiveIdParam(id);
}

export function validateListReviewVotesQuery(query: unknown): ListReviewVotesQuery {
  const safeQuery = query && typeof query === "object" ? (query as Record<string, unknown>) : {};
  const pagination = validatePaginationQuery(safeQuery);

  const reviewIdValue = safeQuery.reviewId;
  if (reviewIdValue === undefined) {
    return pagination;
  }

  return {
    ...pagination,
    reviewId: validatePositiveIdParam(String(reviewIdValue)),
  };
}
