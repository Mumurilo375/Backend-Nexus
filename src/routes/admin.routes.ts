import { Router } from "express";
import AdminOrderController from "../controllers/admin-order.controller";
import ListingPriceChangeController from "../controllers/listing-price-change.controller";
import { adminMiddleware } from "../middlewares/admin.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";

const adminRouter = Router();

adminRouter.use(authMiddleware, adminMiddleware);

adminRouter.get("/orders", AdminOrderController.list);
adminRouter.get("/orders/:id", AdminOrderController.get);
adminRouter.get("/price-history", ListingPriceChangeController.list);

export default adminRouter;
