import { Router } from "express";
import usersRouter from "./users.routes";

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

router.use("/users", usersRouter);

export default router;
