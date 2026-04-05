import { Op } from "sequelize";
import GameKey from "../models/GameKey";
import GamePlatformListing from "../models/GamePlatformListing";
import { AppError } from "../utils/app-error";
import { buildPaginationMeta, getPaginationOffset } from "../utils/pagination";
import {
  BulkCreateGameKeysInput,
  BulkDeleteGameKeysInput,
  CreateGameKeyInput,
  ListGameKeysQuery,
  UpdateGameKeyInput,
} from "../validators/game-key.validator";

type ListingStockSummary = {
  available: number;
  reserved: number;
  sold: number;
  total: number;
};

async function findGameKeyOrFail(id: number): Promise<GameKey> {
  const gameKey = await GameKey.findByPk(id);
  if (!gameKey) {
    throw new AppError(404, "GAME_KEY_NOT_FOUND", "Game key not found");
  }
  return gameKey;
}

async function findListingOrFail(id: number): Promise<GamePlatformListing> {
  const listing = await GamePlatformListing.findByPk(id);
  if (!listing) {
    throw new AppError(404, "LISTING_NOT_FOUND", "Listing not found");
  }
  return listing;
}

async function getListingStock(listingId: number): Promise<ListingStockSummary> {
  const [available, reserved, sold] = await Promise.all([
    GameKey.count({ where: { listingId, status: "available" } }),
    GameKey.count({ where: { listingId, status: "reserved" } }),
    GameKey.count({ where: { listingId, status: "sold" } }),
  ]);

  return {
    available,
    reserved,
    sold,
    total: available + reserved + sold,
  };
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
  await findListingOrFail(input.listingId);

  const existing = await GameKey.findOne({
    where: { keyValue: input.keyValue.trim() },
  });

  if (existing) {
    throw new AppError(409, "GAME_KEY_ALREADY_EXISTS", "Game key already exists");
  }

  return GameKey.create({
    listingId: input.listingId,
    keyValue: input.keyValue.trim(),
    status: "available",
  });
}

export async function bulkCreateGameKeys(input: BulkCreateGameKeysInput) {
  await findListingOrFail(input.listingId);

  const rawKeyValues = input.keyValues
    .map((value) => value.trim())
    .filter(Boolean);
  const keyValues = [...new Set(rawKeyValues)];

  if (rawKeyValues.length === 0) {
    throw new AppError(400, "VALIDATION_ERROR", "keyValues must contain at least one valid key");
  }

  const existingKeys = await GameKey.findAll({
    where: { keyValue: { [Op.in]: keyValues } },
    attributes: ["keyValue"],
  });

  const existingSet = new Set(
    existingKeys.map((item) => String(item.get("keyValue"))),
  );
  const newKeys = keyValues.filter((value) => !existingSet.has(value));

  if (newKeys.length > 0) {
    await GameKey.bulkCreate(
      newKeys.map((keyValue) => ({
        listingId: input.listingId,
        keyValue,
        status: "available",
      })),
    );
  }

  return {
    createdCount: newKeys.length,
    skippedCount: rawKeyValues.length - newKeys.length,
    stock: await getListingStock(input.listingId),
  };
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

export async function bulkDeleteGameKeys(input: BulkDeleteGameKeysInput) {
  await findListingOrFail(input.listingId);

  const ids = [...new Set(input.ids)];
  const keys = await GameKey.findAll({
    where: { id: { [Op.in]: ids } },
  });

  if (keys.length !== ids.length) {
    throw new AppError(400, "VALIDATION_ERROR", "One or more keys are invalid");
  }

  const invalidKey = keys.find(
    (key) =>
      Number(key.get("listingId")) !== input.listingId ||
      String(key.get("status")) !== "available",
  );

  if (invalidKey) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "Only available keys from this listing can be removed",
    );
  }

  await GameKey.destroy({
    where: { id: { [Op.in]: ids } },
  });

  return {
    deletedCount: ids.length,
    stock: await getListingStock(input.listingId),
  };
}
