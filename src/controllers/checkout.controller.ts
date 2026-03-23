import { NextFunction, Request, Response } from "express";
import { checkoutUserCart } from "../services/checkout.service";
import { requireAuthenticatedUserId } from "../utils/auth-user";
import { validateCheckoutInput } from "../validators/checkout.validator";

class CheckoutController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = validateCheckoutInput(req.body);
      const order = await checkoutUserCart(requireAuthenticatedUserId(req), input);
      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  }
}

export default CheckoutController;
