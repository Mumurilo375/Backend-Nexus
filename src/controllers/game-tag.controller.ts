import { NextFunction, Request, Response } from "express";
import { createGameTag, deleteGameTag, listGameTags } from "../services/game-tag.service";
import {
  validateCreateGameTagInput,
  validateGameTagParams,
  validateListGameTagsQuery,
} from "../validators/game-tag.validator";

class GameTagController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = validateListGameTagsQuery(req.query);
      const gameTags = await listGameTags(query);
      res.status(200).json(gameTags);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = validateCreateGameTagInput(req.body);
      const gameTag = await createGameTag(input);
      res.status(201).json(gameTag);
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = validateGameTagParams(req.params.gameId as string, req.params.tagId as string);
      await deleteGameTag(params.gameId, params.tagId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default GameTagController;
