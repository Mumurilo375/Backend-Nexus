import { Router } from "express";
import PlatformController from "../controllers/platform.controller";
import { adminMiddleware } from "../middlewares/admin.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";

const platformsRouter = Router();

platformsRouter.get("/", authMiddleware, PlatformController.list);
platformsRouter.post("/", authMiddleware, adminMiddleware, PlatformController.create);
platformsRouter.get("/:id", authMiddleware, PlatformController.get);
platformsRouter.put("/:id", authMiddleware, adminMiddleware, PlatformController.update);
platformsRouter.delete("/:id", authMiddleware, adminMiddleware, PlatformController.remove);

export default platformsRouter;
