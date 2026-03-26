import { Router } from "express";
import OrderController from "../controllers/order.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const ordersRouter = Router();

ordersRouter.get("/", authMiddleware, OrderController.list);
ordersRouter.post("/:id/confirm-payment", authMiddleware, OrderController.confirmPayment);
ordersRouter.post("/:id/cancel", authMiddleware, OrderController.cancel);
ordersRouter.get("/:id", authMiddleware, OrderController.get);

export default ordersRouter;
