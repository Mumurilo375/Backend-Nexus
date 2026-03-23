import { Router } from "express";
import GameTagController from "../controllers/game-tag.controller";
import { adminMiddleware } from "../middlewares/admin.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";

const gameTagsRouter = Router();

gameTagsRouter.get("/", GameTagController.list);
gameTagsRouter.post("/", authMiddleware, adminMiddleware, GameTagController.create);
gameTagsRouter.delete("/:gameId/:tagId", authMiddleware, adminMiddleware, GameTagController.remove);

export default gameTagsRouter;
