import { Router } from "express";
import authRouter from "./auth.routes";
import cartRouter from "./cart.routes";
import categoriesRouter from "./categories.routes";
import checkoutRouter from "./checkout.routes";
import deliveredKeysRouter from "./delivered-keys.routes";
import gameImagesRouter from "./game-images.routes";
import gameKeysRouter from "./game-keys.routes";
import gameTagsRouter from "./game-tags.routes";
import gamesRouter from "./games.routes";
import historyRouter from "./history.routes";
import libraryRouter from "./library.routes";
import orderItemsRouter from "./order-items.routes";
import ordersRouter from "./orders.routes";
import platformsRouter from "./platforms.routes";
import promotionsRouter from "./promotions.routes";
import reviewVotesRouter from "./review-votes.routes";
import reviewsRouter from "./reviews.routes";
import usersRouter from "./users.routes";
import wishlistRouter from "./wishlist.routes";
import listingsRouter from "./listings.routes";

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
router.use("/delivered-keys", deliveredKeysRouter);
router.use("/reviews", reviewsRouter);
router.use("/review-votes", reviewVotesRouter);
router.use("/game-keys", gameKeysRouter);
router.use("/listings", listingsRouter);
router.use("/promotions", promotionsRouter);
router.use("/game-images", gameImagesRouter);
router.use("/game-tags", gameTagsRouter);

export default router;
