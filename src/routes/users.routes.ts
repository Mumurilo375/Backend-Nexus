import { Router } from "express";
import UserController from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const usersRouter = Router();

usersRouter.get("/", UserController.list);
usersRouter.post("/", UserController.create);

usersRouter.get("/:id", UserController.get);

usersRouter.put("/:id", authMiddleware, UserController.update);
usersRouter.delete("/:id", authMiddleware, UserController.remove);

export default usersRouter;