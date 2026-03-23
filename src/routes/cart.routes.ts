import { Router } from "express";
import CartController from "../controllers/cart.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const cartRouter = Router();

cartRouter.get("/", authMiddleware, CartController.list);
cartRouter.post("/:listingId", authMiddleware, CartController.add);
cartRouter.delete("/:listingId", authMiddleware, CartController.remove);
cartRouter.delete("/", authMiddleware, CartController.clear);

export default cartRouter;
