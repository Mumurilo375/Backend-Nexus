import { Router } from "express";
import PlatformController from "../controllers/platform.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const platformsRouter = Router();

platformsRouter.get("/", authMiddleware, PlatformController.list);
platformsRouter.post("/", authMiddleware, PlatformController.create);
platformsRouter.get("/:id", authMiddleware, PlatformController.get);
platformsRouter.put("/:id", authMiddleware, PlatformController.update);
platformsRouter.delete("/:id", authMiddleware, PlatformController.remove);

export default platformsRouter;
