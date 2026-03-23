import GameImages from "../models/Game_images";
import Games from "../models/Games";
import { AppError } from "../utils/app-error";
import { buildPaginationMeta, getPaginationOffset } from "../utils/pagination";
import { CreateGameImageInput, ListGameImagesQuery, UpdateGameImageInput } from "../validators/game-image.validator";

async function findGameImageOrFail(id: number): Promise<GameImages> {
  const image = await GameImages.findByPk(id);
  if (!image) {
    throw new AppError(404, "GAME_IMAGE_NOT_FOUND", "Game image not found");
  }
  return image;
}

export async function listGameImages(query: ListGameImagesQuery) {
  const offset = getPaginationOffset(query.page, query.limit);

  const where = query.gameId ? { gameId: query.gameId } : undefined;

  const result = await GameImages.findAndCountAll({
    where,
    limit: query.limit,
    offset,
    order: [["sortOrder", "ASC"], ["id", "DESC"]],
    include: [{ model: Games, as: "game" }],
  });

  return {
    items: result.rows,
    meta: buildPaginationMeta(query, result.count),
  };
}

export async function getGameImageById(id: number) {
  const image = await GameImages.findByPk(id, {
    include: [{ model: Games, as: "game" }],
  });

  if (!image) {
    throw new AppError(404, "GAME_IMAGE_NOT_FOUND", "Game image not found");
  }

  return image;
}

export async function createGameImage(input: CreateGameImageInput) {
  const game = await Games.findByPk(input.gameId);
  if (!game) {
    throw new AppError(404, "GAME_NOT_FOUND", "Game not found");
  }

  return GameImages.create({
    gameId: input.gameId,
    imageUrl: input.imageUrl,
    sortOrder: input.sortOrder ?? 0,
  });
}

export async function updateGameImage(id: number, input: UpdateGameImageInput) {
  const image = await findGameImageOrFail(id);
  await image.update(input);
  return image;
}

export async function deleteGameImage(id: number) {
  const image = await findGameImageOrFail(id);
  await image.destroy();
}
