import { Router } from "express";
import GameImageController from "../controllers/game-image.controller";
import { adminMiddleware } from "../middlewares/admin.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";

const gameImagesRouter = Router();

gameImagesRouter.get("/", GameImageController.list);
gameImagesRouter.get("/:id", GameImageController.get);
gameImagesRouter.post("/", authMiddleware, adminMiddleware, GameImageController.create);
gameImagesRouter.put("/:id", authMiddleware, adminMiddleware, GameImageController.update);
gameImagesRouter.delete("/:id", authMiddleware, adminMiddleware, GameImageController.remove);

export default gameImagesRouter;
