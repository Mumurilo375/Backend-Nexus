import { NextFunction, Request, Response } from "express";
import {
  addKeysToGamePlatform,
  createGame,
  deleteGame,
  getGameById,
  getGameDetailsById,
  getGamePlatformsById,
  listGames,
  updateGame,
  updateGamePlatform,
} from "../services/game.service";
import {
  validateAddGamePlatformKeysInput,
  validatePlatformIdParam,
  validateUpdateGamePlatformInput,
} from "../validators/game-platform-admin.validator";
import {
  validateCreateGameInput,
  validateIdParam,
  validateListGamesQuery,
  validateUpdateGameInput,
} from "../validators/game.validator";
import {
  UploadedGameMediaFiles,
} from "../middlewares/game-media-upload.middleware";
import { deleteTemporaryUploads } from "../utils/media-storage";

function readUploadedGameMediaFiles(files: Request["files"]) {
  const uploadedFiles = (files as UploadedGameMediaFiles | undefined) ?? {};

  return {
    coverFile: uploadedFiles.coverFile?.[0] ?? null,
    galleryFiles: uploadedFiles.galleryFiles ?? [],
  };
}

async function cleanupUploadedGameMedia(files: Request["files"]) {
  const uploadedFiles = readUploadedGameMediaFiles(files);

  await deleteTemporaryUploads([
    uploadedFiles.coverFile,
    ...uploadedFiles.galleryFiles,
  ]);
}

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

  static async details(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gameId = validateIdParam(req.params.id as string);
      const gameDetails = await getGameDetailsById(gameId);
      res.status(200).json(gameDetails);
    } catch (error) {
      next(error);
    }
  }

  static async platforms(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gameId = validateIdParam(req.params.id as string);
      const gamePlatforms = await getGamePlatformsById(gameId);
      res.status(200).json(gamePlatforms);
    } catch (error) {
      next(error);
    }
  }

  static async updatePlatform(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gameId = validateIdParam(req.params.id as string);
      const platformId = validatePlatformIdParam(req.params.platformId as string);
      const input = validateUpdateGamePlatformInput(req.body);
      const platformState = await updateGamePlatform(
        gameId,
        platformId,
        input,
        req.user?.id,
      );
      res.status(200).json(platformState);
    } catch (error) {
      next(error);
    }
  }

  static async addPlatformKeys(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gameId = validateIdParam(req.params.id as string);
      const platformId = validatePlatformIdParam(req.params.platformId as string);
      const input = validateAddGamePlatformKeysInput(req.body);
      const result = await addKeysToGamePlatform(gameId, platformId, input);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = validateCreateGameInput(req.body);
      const createdGame = await createGame(input, readUploadedGameMediaFiles(req.files));
      await cleanupUploadedGameMedia(req.files);
      res.status(201).json(createdGame);
    } catch (error) {
      await cleanupUploadedGameMedia(req.files);
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gameId = validateIdParam(req.params.id as string);
      const input = validateUpdateGameInput(req.body);
      const updatedGame = await updateGame(gameId, input, readUploadedGameMediaFiles(req.files));
      await cleanupUploadedGameMedia(req.files);
      res.status(200).json(updatedGame);
    } catch (error) {
      await cleanupUploadedGameMedia(req.files);
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
