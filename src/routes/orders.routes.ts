import { Router } from "express";
import OrderController from "../controllers/order.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const ordersRouter = Router();

ordersRouter.get("/", authMiddleware, OrderController.list);
ordersRouter.get("/:id", authMiddleware, OrderController.get);

export default ordersRouter;
