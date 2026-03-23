import GameKey from "../models/GameKey";
import GamePlatformListing from "../models/GamePlatformListing";
import { AppError } from "../utils/app-error";
import { buildPaginationMeta, getPaginationOffset } from "../utils/pagination";
import { CreateGameKeyInput, ListGameKeysQuery, UpdateGameKeyInput } from "../validators/game-key.validator";

async function findGameKeyOrFail(id: number): Promise<GameKey> {
  const gameKey = await GameKey.findByPk(id);
  if (!gameKey) {
    throw new AppError(404, "GAME_KEY_NOT_FOUND", "Game key not found");
  }
  return gameKey;
}

export async function listGameKeys(query: ListGameKeysQuery) {
  const offset = getPaginationOffset(query.page, query.limit);

  const where = query.listingId ? { listingId: query.listingId } : undefined;

  const result = await GameKey.findAndCountAll({
    where,
    limit: query.limit,
    offset,
    order: [["id", "DESC"]],
    include: [{ model: GamePlatformListing, as: "listing" }],
  });

  return {
    items: result.rows,
    meta: buildPaginationMeta(query, result.count),
  };
}

export async function getGameKeyById(id: number) {
  const gameKey = await GameKey.findByPk(id, {
    include: [{ model: GamePlatformListing, as: "listing" }],
  });

  if (!gameKey) {
    throw new AppError(404, "GAME_KEY_NOT_FOUND", "Game key not found");
  }

  return gameKey;
}

export async function createGameKey(input: CreateGameKeyInput) {
  const listing = await GamePlatformListing.findByPk(input.listingId);
  if (!listing) {
    throw new AppError(404, "LISTING_NOT_FOUND", "Listing not found");
  }

  return GameKey.create({
    listingId: input.listingId,
    keyValue: input.keyValue,
    status: "available",
  });
}

export async function updateGameKey(id: number, input: UpdateGameKeyInput) {
  const gameKey = await findGameKeyOrFail(id);

  const now = new Date();
  await gameKey.update({
    status: input.status,
    reservedAt: input.status === "reserved" ? now : null,
    soldAt: input.status === "sold" ? now : null,
  });

  return gameKey;
}

export async function deleteGameKey(id: number) {
  const gameKey = await findGameKeyOrFail(id);
  await gameKey.destroy();
}
