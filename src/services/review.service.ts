import Games from "../models/Games";
import Review from "../models/Review";
import ReviewVote from "../models/ReviewVote";
import Users from "../models/Users";
import { AppError } from "../utils/app-error";
import { buildPaginationMeta, getPaginationOffset } from "../utils/pagination";
import { CreateReviewInput, ListReviewsQuery, UpdateReviewInput } from "../validators/review.validator";

const REVIEW_INCLUDE = [
  { model: Games, as: "game" },
  { model: Users, as: "user", attributes: { exclude: ["passwordHash"] } },
  { model: ReviewVote, as: "votes" },
];

async function findReviewOrFail(id: number): Promise<Review> {
  const review = await Review.findByPk(id);
  if (!review) {
    throw new AppError(404, "REVIEW_NOT_FOUND", "Review not found");
  }
  return review;
}

function ensureOwner(review: Review, userId: number): void {
  if (Number(review.get("userId")) !== userId) {
    throw new AppError(403, "FORBIDDEN", "You can only manage your own review");
  }
}

export async function listReviews(query: ListReviewsQuery) {
  const offset = getPaginationOffset(query.page, query.limit);

  const where = query.gameId ? { gameId: query.gameId } : undefined;

  const result = await Review.findAndCountAll({
    where,
    limit: query.limit,
    offset,
    order: [["id", "DESC"]],
    include: REVIEW_INCLUDE,
  });

  return {
    items: result.rows,
    meta: buildPaginationMeta(query, result.count),
  };
}

export async function getReviewById(id: number) {
  const review = await Review.findByPk(id, {
    include: REVIEW_INCLUDE,
  });

  if (!review) {
    throw new AppError(404, "REVIEW_NOT_FOUND", "Review not found");
  }

  return review;
}

export async function createReview(userId: number, input: CreateReviewInput) {
  const game = await Games.findByPk(input.gameId);
  if (!game) {
    throw new AppError(404, "GAME_NOT_FOUND", "Game not found");
  }

  const existing = await Review.findOne({ where: { userId, gameId: input.gameId } });
  if (existing) {
    throw new AppError(409, "REVIEW_ALREADY_EXISTS", "You already reviewed this game");
  }

  return Review.create({
    userId,
    gameId: input.gameId,
    rating: input.rating,
    comment: input.comment,
  });
}

export async function updateReview(userId: number, id: number, input: UpdateReviewInput) {
  const review = await findReviewOrFail(id);
  ensureOwner(review, userId);

  await review.update({
    rating: input.rating,
    comment: input.comment,
  });

  return review;
}

export async function deleteReview(userId: number, id: number) {
  const review = await findReviewOrFail(id);
  ensureOwner(review, userId);
  await review.destroy();
}
