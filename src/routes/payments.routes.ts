import { Router } from "express";
import PaymentController from "../controllers/payment.controller";

const paymentsRouter = Router();

paymentsRouter.post(
  "/stripe/webhook",
  PaymentController.stripeWebhook
);

export default paymentsRouter;
