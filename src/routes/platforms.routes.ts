import { Router } from "express";
import PlatformController from "../controllers/platform.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const platformsRouter = Router();

platformsRouter.get("/", authMiddleware, PlatformController.findAll);
platformsRouter.post("/", authMiddleware, PlatformController.create);
platformsRouter.get("/:id", authMiddleware, PlatformController.getById);
platformsRouter.put("/:id", authMiddleware, PlatformController.update);
platformsRouter.delete("/:id", authMiddleware, PlatformController.delete);

export default platformsRouter;
