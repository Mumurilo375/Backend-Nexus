import { Router } from "express";
import ReviewController from "../controllers/review.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const reviewsRouter = Router();

reviewsRouter.get("/", ReviewController.list);
reviewsRouter.get("/:id", ReviewController.get);
reviewsRouter.post("/", authMiddleware, ReviewController.create);
reviewsRouter.put("/:id", authMiddleware, ReviewController.update);
reviewsRouter.delete("/:id", authMiddleware, ReviewController.remove);

export default reviewsRouter;
