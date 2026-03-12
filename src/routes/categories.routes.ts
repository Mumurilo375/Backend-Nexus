import { Router } from "express";
import CategoryController from "../controllers/category.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const categoriesRouter = Router();

categoriesRouter.get("/", authMiddleware, CategoryController.findAll);
categoriesRouter.post("/", authMiddleware, CategoryController.create);
categoriesRouter.get("/:id", authMiddleware, CategoryController.getById);
categoriesRouter.put("/:id", authMiddleware, CategoryController.update);
categoriesRouter.delete("/:id", authMiddleware, CategoryController.delete);

export default categoriesRouter;
