import { NextFunction, Request, Response } from "express";
import {
  createGameKey,
  deleteGameKey,
  getGameKeyById,
  listGameKeys,
  updateGameKey,
} from "../services/game-key.service";
import {
  validateCreateGameKeyInput,
  validateGameKeyIdParam,
  validateListGameKeysQuery,
  validateUpdateGameKeyInput,
} from "../validators/game-key.validator";

class GameKeyController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = validateListGameKeysQuery(req.query);
      const keys = await listGameKeys(query);
      res.status(200).json(keys);
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gameKeyId = validateGameKeyIdParam(req.params.id as string);
      const key = await getGameKeyById(gameKeyId);
      res.status(200).json(key);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = validateCreateGameKeyInput(req.body);
      const key = await createGameKey(input);
      res.status(201).json(key);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gameKeyId = validateGameKeyIdParam(req.params.id as string);
      const input = validateUpdateGameKeyInput(req.body);
      const key = await updateGameKey(gameKeyId, input);
      res.status(200).json(key);
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gameKeyId = validateGameKeyIdParam(req.params.id as string);
      await deleteGameKey(gameKeyId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default GameKeyController;
