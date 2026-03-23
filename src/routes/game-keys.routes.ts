import { Router } from "express";
import GameKeyController from "../controllers/game-key.controller";
import { adminMiddleware } from "../middlewares/admin.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";

const gameKeysRouter = Router();

gameKeysRouter.get("/", authMiddleware, adminMiddleware, GameKeyController.list);
gameKeysRouter.get("/:id", authMiddleware, adminMiddleware, GameKeyController.get);
gameKeysRouter.post("/", authMiddleware, adminMiddleware, GameKeyController.create);
gameKeysRouter.put("/:id", authMiddleware, adminMiddleware, GameKeyController.update);
gameKeysRouter.delete("/:id", authMiddleware, adminMiddleware, GameKeyController.remove);

export default gameKeysRouter;
