import Games from "../models/Games";
import Categories from "../models/Category";
import Tags from "../models/Tags";
import GamePlatformListing from "../models/GamePlatformListing";
import Platform from "../models/Platform";
import { AppError } from "../utils/app-error";
import { CreateGameInput, ListGamesQuery, UpdateGameInput } from "../validators/game.validator";

async function findGameOrFail(id: number): Promise<Games> {
  const game = await Games.findByPk(id);
  if (!game) {
    throw new AppError(404, "GAME_NOT_FOUND", "Game not found");
  }
  return game;
}

export async function listGames(query: ListGamesQuery) {
  const offset = (query.page - 1) * query.limit;

  const result = await Games.findAndCountAll({
    limit: query.limit,
    offset,
    order: [["createdAt", "DESC"]],
    include: [
      { model: Categories, as: "categories", through: { attributes: [] } },
      { model: Tags, as: "tags", through: { attributes: [] } },
    ],
  });

  return {
    items: result.rows,
    meta: {
      page: query.page,
      limit: query.limit,
      total: result.count,
      totalPages: Math.ceil(result.count / query.limit),
    },
  };
}

export async function getGameById(id: number) {
  const game = await Games.findByPk(id, {
    include: [
      { model: Categories, as: "categories", through: { attributes: [] } },
      { model: Tags, as: "tags", through: { attributes: [] } },
      {
        model: GamePlatformListing,
        as: "platformListings",
        include: [{ model: Platform, as: "platform" }],
      },
    ],
  });

  if (!game) {
    throw new AppError(404, "GAME_NOT_FOUND", "Game not found");
  }

  return game;
}

export async function createGame(input: CreateGameInput) {
  return Games.create({ ...input });
}

export async function updateGame(id: number, input: UpdateGameInput) {
  const game = await findGameOrFail(id);
  await game.update(input);
  return game;
}

export async function deleteGame(id: number) {
  const game = await findGameOrFail(id);
  await game.destroy();
}
