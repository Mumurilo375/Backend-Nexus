import { Router } from "express";
import ReviewVoteController from "../controllers/review-vote.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const reviewVotesRouter = Router();

reviewVotesRouter.get("/", ReviewVoteController.list);
reviewVotesRouter.post("/:reviewId", authMiddleware, ReviewVoteController.add);
reviewVotesRouter.delete("/:reviewId", authMiddleware, ReviewVoteController.remove);

export default reviewVotesRouter;
