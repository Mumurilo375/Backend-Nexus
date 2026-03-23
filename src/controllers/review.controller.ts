import { NextFunction, Request, Response } from "express";
import {
  createReview,
  deleteReview,
  getReviewById,
  listReviews,
  updateReview,
} from "../services/review.service";
import { requireAuthenticatedUserId } from "../utils/auth-user";
import {
  validateCreateReviewInput,
  validateListReviewsQuery,
  validateReviewIdParam,
  validateUpdateReviewInput,
} from "../validators/review.validator";

class ReviewController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = validateListReviewsQuery(req.query);
      const reviews = await listReviews(query);
      res.status(200).json(reviews);
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reviewId = validateReviewIdParam(req.params.id as string);
      const review = await getReviewById(reviewId);
      res.status(200).json(review);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = validateCreateReviewInput(req.body);
      const review = await createReview(requireAuthenticatedUserId(req), input);
      res.status(201).json(review);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reviewId = validateReviewIdParam(req.params.id as string);
      const input = validateUpdateReviewInput(req.body);
      const review = await updateReview(requireAuthenticatedUserId(req), reviewId, input);
      res.status(200).json(review);
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reviewId = validateReviewIdParam(req.params.id as string);
      await deleteReview(requireAuthenticatedUserId(req), reviewId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default ReviewController;
