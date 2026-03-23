import { Router } from "express";
import authRouter from "./auth.routes";
import categoriesRouter from "./categories.routes";
import gamesRouter from "./games.routes";
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

export default router;
