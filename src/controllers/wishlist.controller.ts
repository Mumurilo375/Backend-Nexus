import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error";
import {
  addGameToWishlist,
  listUserWishlist,
  removeGameFromWishlist,
} from "../services/wishlist.service";
import { validateGameIdParam } from "../validators/wishlist.validator";

class WishlistController {
  static async list(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, "UNAUTHORIZED", "Token not provided");
      }

      const wishlist = await listUserWishlist(userId);
      res.status(200).json(wishlist);
    } catch (error) {
      next(error);
    }
  }

  static async add(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, "UNAUTHORIZED", "Token not provided");
      }

      const gameId = validateGameIdParam(req.params.gameId as string);
      const item = await addGameToWishlist(userId, gameId);
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  }

  static async remove(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, "UNAUTHORIZED", "Token not provided");
      }

      const gameId = validateGameIdParam(req.params.gameId as string);
      await removeGameFromWishlist(userId, gameId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default WishlistController;
