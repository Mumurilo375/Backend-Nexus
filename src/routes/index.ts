import { Router } from "express";
import authRouter from "./auth.routes";
import cartRouter from "./cart.routes";
import categoriesRouter from "./categories.routes";
import checkoutRouter from "./checkout.routes";
import gamesRouter from "./games.routes";
import historyRouter from "./history.routes";
import libraryRouter from "./library.routes";
import orderItemsRouter from "./order-items.routes";
import ordersRouter from "./orders.routes";
import platformsRouter from "./platforms.routes";
import usersRouter from "./users.routes";
import wishlistRouter from "./wishlist.routes";

const router = Router();

router.get("/", (_req, res) => {
  res.status(200).json({
    name: "nexus-backend",
    status: "ok",
    message: "API is running",
  });
});

router.get("/health", (_req, res) => {
  res.status(200).json({ status: "healthy" });
});

router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/games", gamesRouter);
router.use("/categories", categoriesRouter);
router.use("/platforms", platformsRouter);
router.use("/wishlists", wishlistRouter);
router.use("/cart", cartRouter);
router.use("/checkout", checkoutRouter);
router.use("/orders", ordersRouter);
router.use("/order-items", orderItemsRouter);
router.use("/library", libraryRouter);
router.use("/history", historyRouter);

export default router;
