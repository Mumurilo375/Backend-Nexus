import { NextFunction, Request, Response } from "express";
import { createPlatform, deletePlatform, getPlatformById, listPlatforms, updatePlatform } from "../services/platform.service";
import {
  validateCreatePlatformInput,
  validateIdParam,
  validateListPlatformsQuery,
  validateUpdatePlatformInput,
} from "../validators/platform.validator";

class PlatformController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const paginationFilters = validateListPlatformsQuery(req.query);
      const platformsPage = await listPlatforms(paginationFilters);
      res.status(200).json(platformsPage);
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const platformId = validateIdParam(req.params.id as string);
      const platform = await getPlatformById(platformId);
      res.status(200).json(platform);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const newPlatformData = validateCreatePlatformInput(req.body);
      const createdPlatform = await createPlatform(newPlatformData);
      res.status(201).json(createdPlatform);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const platformId = validateIdParam(req.params.id as string);
      const updatedPlatformData = validateUpdatePlatformInput(req.body);
      const updatedPlatform = await updatePlatform(platformId, updatedPlatformData);
      res.status(200).json(updatedPlatform);
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const platformId = validateIdParam(req.params.id as string);
      await deletePlatform(platformId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default PlatformController;
