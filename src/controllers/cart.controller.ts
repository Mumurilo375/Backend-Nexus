import { NextFunction, Request, Response } from "express";
import {
  addListingToCart,
  clearUserCart,
  listUserCart,
  removeListingFromCart,
} from "../services/cart.service";
import { requireAuthenticatedUserId } from "../utils/auth-user";
import { validateListingIdParam } from "../validators/cart.validator";

class CartController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cart = await listUserCart(requireAuthenticatedUserId(req));
      res.status(200).json(cart);
    } catch (error) {
      next(error);
    }
  }

  static async add(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const listingId = validateListingIdParam(req.params.listingId as string);
      const item = await addListingToCart(requireAuthenticatedUserId(req), listingId);
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const listingId = validateListingIdParam(req.params.listingId as string);
      await removeListingFromCart(requireAuthenticatedUserId(req), listingId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  static async clear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await clearUserCart(requireAuthenticatedUserId(req));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default CartController;
