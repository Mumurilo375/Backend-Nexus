import { Router } from "express";
import CategoryController from "../controllers/category.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const categoriesRouter = Router();

categoriesRouter.get("/", authMiddleware, CategoryController.list);
categoriesRouter.post("/", authMiddleware, CategoryController.create);
categoriesRouter.get("/:id", authMiddleware, CategoryController.get);
categoriesRouter.put("/:id", authMiddleware, CategoryController.update);
categoriesRouter.delete("/:id", authMiddleware, CategoryController.remove);

export default categoriesRouter;
