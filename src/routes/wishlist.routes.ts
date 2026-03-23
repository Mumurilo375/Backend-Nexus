import { Router } from "express";
import WishlistController from "../controllers/wishlist.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const wishlistRouter = Router();

wishlistRouter.get("/", authMiddleware, WishlistController.list);
wishlistRouter.post("/:gameId", authMiddleware, WishlistController.add);
wishlistRouter.delete("/:gameId", authMiddleware, WishlistController.remove);

export default wishlistRouter;
