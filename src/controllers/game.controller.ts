import { NextFunction, Request, Response } from "express";
import { createGame, deleteGame, getGameById, listGames, updateGame } from "../services/game.service";
import {
  validateCreateGameInput,
  validateIdParam,
  validateListGamesQuery,
  validateUpdateGameInput,
} from "../validators/game.validator";

class GameController {
  static async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = validateListGamesQuery(req.query as Record<string, unknown>);
      const result = await listGames(query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = validateIdParam(req.params.id as string);
      const result = await getGameById(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = validateCreateGameInput(req.body as Record<string, unknown>);
      const result = await createGame(payload);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = validateIdParam(req.params.id as string);
      const payload = validateUpdateGameInput(req.body as Record<string, unknown>);
      const result = await updateGame(id, payload);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = validateIdParam(req.params.id as string);
      await deleteGame(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default GameController;
