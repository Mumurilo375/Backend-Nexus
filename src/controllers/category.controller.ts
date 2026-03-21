import { NextFunction, Request, Response } from "express";
import { createCategory, deleteCategory, getCategoryById, listCategories, updateCategory } from "../services/category.service";
import {
  validateCreateCategoryInput,
  validateIdParam,
  validateListCategoriesQuery,
  validateUpdateCategoryInput,
} from "../validators/category.validator";

class CategoryController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const paginationFilters = validateListCategoriesQuery(req.query);
      const categoriesPage = await listCategories(paginationFilters);
      res.status(200).json(categoriesPage);
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categoryId = validateIdParam(req.params.id as string);
      const category = await getCategoryById(categoryId);
      res.status(200).json(category);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const newCategoryData = validateCreateCategoryInput(req.body);
      const createdCategory = await createCategory(newCategoryData);
      res.status(201).json(createdCategory);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categoryId = validateIdParam(req.params.id as string);
      const updatedCategoryData = validateUpdateCategoryInput(req.body);
      const updatedCategory = await updateCategory(categoryId, updatedCategoryData);
      res.status(200).json(updatedCategory);
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categoryId = validateIdParam(req.params.id as string);
      await deleteCategory(categoryId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default CategoryController;
