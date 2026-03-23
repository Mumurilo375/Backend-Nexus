import { NextFunction, Request, Response } from "express";
import {
  addReviewVote,
  listReviewVotes,
  removeReviewVote,
} from "../services/review-vote.service";
import { requireAuthenticatedUserId } from "../utils/auth-user";
import {
  validateListReviewVotesQuery,
  validateReviewIdParam,
} from "../validators/review-vote.validator";

class ReviewVoteController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = validateListReviewVotesQuery(req.query);
      const votes = await listReviewVotes(query);
      res.status(200).json(votes);
    } catch (error) {
      next(error);
    }
  }

  static async add(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reviewId = validateReviewIdParam(req.params.reviewId as string);
      const vote = await addReviewVote(requireAuthenticatedUserId(req), reviewId);
      res.status(201).json(vote);
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reviewId = validateReviewIdParam(req.params.reviewId as string);
      await removeReviewVote(requireAuthenticatedUserId(req), reviewId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default ReviewVoteController;
