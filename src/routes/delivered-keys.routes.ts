import { Router } from "express";
import DeliveredKeyController from "../controllers/delivered-key.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const deliveredKeysRouter = Router();

deliveredKeysRouter.get("/", authMiddleware, DeliveredKeyController.list);
deliveredKeysRouter.get("/:id", authMiddleware, DeliveredKeyController.get);

export default deliveredKeysRouter;
