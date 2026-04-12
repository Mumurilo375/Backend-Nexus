import { Router } from "express";
import UserController from "../controllers/user.controller";
import { adminMiddleware } from "../middlewares/admin.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { userAvatarUpload } from "../middlewares/user-avatar-upload.middleware";

const usersRouter = Router();

usersRouter.get("/", authMiddleware, adminMiddleware, UserController.list);
usersRouter.post("/", userAvatarUpload, UserController.create);

usersRouter.get("/:id", authMiddleware, UserController.get);

usersRouter.put("/:id", authMiddleware, userAvatarUpload, UserController.update);
usersRouter.delete("/:id", authMiddleware, UserController.remove);

export default usersRouter;
