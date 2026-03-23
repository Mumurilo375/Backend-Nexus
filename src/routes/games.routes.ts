import { Router } from "express";
import GameController from "../controllers/game.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const gamesRouter = Router();

gamesRouter.get("/", GameController.list);
gamesRouter.get("/:id", GameController.get);

gamesRouter.post("/", authMiddleware, GameController.create);
gamesRouter.put("/:id", authMiddleware, GameController.update);
gamesRouter.delete("/:id", authMiddleware, GameController.remove);

export default gamesRouter;
