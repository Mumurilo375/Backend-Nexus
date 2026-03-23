import { Router } from "express";
import OrderItemController from "../controllers/order-item.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const orderItemsRouter = Router();

orderItemsRouter.get("/", authMiddleware, OrderItemController.list);
orderItemsRouter.get("/:id", authMiddleware, OrderItemController.get);

export default orderItemsRouter;
