import { NextFunction, Request, Response } from "express";
import { createCategory, deleteCategory, getCategoryById, listCategories, updateCategory } from "../services/category.service";
import {
  validateCreateCategoryInput,
  validateIdParam,
  validateListCategoriesQuery,
  validateUpdateCategoryInput,
} from "../validators/category.validator";

class CategoryController {
  static async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = validateListCategoriesQuery(req.query as Record<string, unknown>);
      const result = await listCategories(query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = validateIdParam(req.params.id as string);
      const result = await getCategoryById(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = validateCreateCategoryInput(req.body as Record<string, unknown>);
      const result = await createCategory(payload);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = validateIdParam(req.params.id as string);
      const payload = validateUpdateCategoryInput(req.body as Record<string, unknown>);
      const result = await updateCategory(id, payload);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = validateIdParam(req.params.id as string);
      await deleteCategory(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default CategoryController;
