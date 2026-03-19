import { Router } from "express";
import GameController from "../controllers/game.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const gamesRouter = Router();

gamesRouter.get("/", GameController.findAll);
gamesRouter.post("/", authMiddleware, GameController.create);
gamesRouter.get("/:id", GameController.getById);
gamesRouter.put("/:id", authMiddleware, GameController.update);
gamesRouter.delete("/:id", authMiddleware, GameController.delete);

export default gamesRouter;
