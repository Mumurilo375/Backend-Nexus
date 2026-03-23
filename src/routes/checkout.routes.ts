import { Router } from "express";
import CheckoutController from "../controllers/checkout.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const checkoutRouter = Router();

checkoutRouter.post("/", authMiddleware, CheckoutController.create);

export default checkoutRouter;
