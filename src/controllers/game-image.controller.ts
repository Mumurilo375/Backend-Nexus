import { NextFunction, Request, Response } from "express";
import {
  createGameImage,
  deleteGameImage,
  getGameImageById,
  listGameImages,
  updateGameImage,
} from "../services/game-image.service";
import {
  validateCreateGameImageInput,
  validateGameImageIdParam,
  validateListGameImagesQuery,
  validateUpdateGameImageInput,
} from "../validators/game-image.validator";

class GameImageController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = validateListGameImagesQuery(req.query);
      const images = await listGameImages(query);
      res.status(200).json(images);
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const imageId = validateGameImageIdParam(req.params.id as string);
      const image = await getGameImageById(imageId);
      res.status(200).json(image);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = validateCreateGameImageInput(req.body);
      const image = await createGameImage(input);
      res.status(201).json(image);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const imageId = validateGameImageIdParam(req.params.id as string);
      const input = validateUpdateGameImageInput(req.body);
      const image = await updateGameImage(imageId, input);
      res.status(200).json(image);
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const imageId = validateGameImageIdParam(req.params.id as string);
      await deleteGameImage(imageId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default GameImageController;
