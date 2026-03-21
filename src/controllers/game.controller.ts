import { NextFunction, Request, Response } from "express";
import { createGame, deleteGame, getGameById, listGames, updateGame } from "../services/game.service";
import {
  validateCreateGameInput,
  validateIdParam,
  validateListGamesQuery,
  validateUpdateGameInput,
} from "../validators/game.validator";

class GameController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const paginationFilters = validateListGamesQuery(req.query);
      const gamesPage = await listGames(paginationFilters);
      res.status(200).json(gamesPage);
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gameId = validateIdParam(req.params.id as string);
      const game = await getGameById(gameId);
      res.status(200).json(game);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const newGameData = validateCreateGameInput(req.body);
      const createdGame = await createGame(newGameData);
      res.status(201).json(createdGame);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gameId = validateIdParam(req.params.id as string);
      const updatedGameData = validateUpdateGameInput(req.body);
      const updatedGame = await updateGame(gameId, updatedGameData);
      res.status(200).json(updatedGame);
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gameId = validateIdParam(req.params.id as string);
      await deleteGame(gameId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default GameController;
