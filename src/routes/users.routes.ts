import { Router } from "express";
import UserController from "../controllers/user.controller";

const usersRouter = Router();

usersRouter.get("/", UserController.findAll);
usersRouter.post("/", UserController.create);
usersRouter.get("/:id", UserController.getById);

export default usersRouter;
