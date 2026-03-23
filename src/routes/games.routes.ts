import { Router } from "express";
import GameController from "../controllers/game.controller";
import { adminMiddleware } from "../middlewares/admin.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";

const gamesRouter = Router();

gamesRouter.get("/", GameController.list);
gamesRouter.get("/:id", GameController.get);

gamesRouter.post("/", authMiddleware, adminMiddleware, GameController.create);
gamesRouter.put("/:id", authMiddleware, adminMiddleware, GameController.update);
gamesRouter.delete("/:id", authMiddleware, adminMiddleware, GameController.remove);

export default gamesRouter;
