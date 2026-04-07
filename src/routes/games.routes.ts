import { Router } from "express";
import GameController from "../controllers/game.controller";
import { adminMiddleware } from "../middlewares/admin.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { gameMediaFields } from "../middlewares/game-media-upload.middleware";

const gamesRouter = Router();

gamesRouter.get("/", GameController.list);
gamesRouter.get("/:id/details", GameController.details);
gamesRouter.get(
  "/:id/platforms",
  authMiddleware,
  adminMiddleware,
  GameController.platforms,
);
gamesRouter.get("/:id", GameController.get);

gamesRouter.post(
  "/",
  authMiddleware,
  adminMiddleware,
  gameMediaFields,
  GameController.create,
);
gamesRouter.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  gameMediaFields,
  GameController.update,
);
gamesRouter.put(
  "/:id/platforms/:platformId",
  authMiddleware,
  adminMiddleware,
  GameController.updatePlatform,
);
gamesRouter.post(
  "/:id/platforms/:platformId/keys",
  authMiddleware,
  adminMiddleware,
  GameController.addPlatformKeys,
);
gamesRouter.delete("/:id", authMiddleware, adminMiddleware, GameController.remove);

export default gamesRouter;
