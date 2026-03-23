import { Router } from "express";
import CategoryController from "../controllers/category.controller";
import { adminMiddleware } from "../middlewares/admin.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";

const categoriesRouter = Router();

categoriesRouter.get("/", authMiddleware, CategoryController.list);
categoriesRouter.post("/", authMiddleware, adminMiddleware, CategoryController.create);
categoriesRouter.get("/:id", authMiddleware, CategoryController.get);
categoriesRouter.put("/:id", authMiddleware, adminMiddleware, CategoryController.update);
categoriesRouter.delete("/:id", authMiddleware, adminMiddleware, CategoryController.remove);

export default categoriesRouter;
