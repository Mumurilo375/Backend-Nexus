import { NextFunction, Request, Response } from "express";
import { createPlatform, deletePlatform, getPlatformById, listPlatforms, updatePlatform } from "../services/platform.service";
import {
  validateCreatePlatformInput,
  validateIdParam,
  validateListPlatformsQuery,
  validateUpdatePlatformInput,
} from "../validators/platform.validator";

class PlatformController {
  static async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = validateListPlatformsQuery(req.query as Record<string, unknown>);
      const result = await listPlatforms(query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = validateIdParam(req.params.id as string);
      const result = await getPlatformById(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = validateCreatePlatformInput(req.body as Record<string, unknown>);
      const result = await createPlatform(payload);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = validateIdParam(req.params.id as string);
      const payload = validateUpdatePlatformInput(req.body as Record<string, unknown>);
      const result = await updatePlatform(id, payload);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = validateIdParam(req.params.id as string);
      await deletePlatform(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default PlatformController;
