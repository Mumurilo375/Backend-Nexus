import { Op } from "sequelize";
import GameKey from "../models/GameKey";
import GamePlatformListing from "../models/GamePlatformListing";
import { AppError } from "../utils/app-error";
import { buildPaginationMeta, getPaginationOffset } from "../utils/pagination";
import { countListingStockSummary } from "../utils/stock";
import {
  BulkCreateGameKeysInput,
  BulkDeleteGameKeysInput,
  CreateGameKeyInput,
  ListGameKeysQuery,
  UpdateGameKeyInput,
} from "../validators/game-key.validator";

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

function normalizeKeyValue(value: string) {
  return value.trim();
}

function normalizeKeyValues(values: string[]) {
  const validValues = values.map(normalizeKeyValue).filter(Boolean);

  if (validValues.length === 0) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "keyValues must contain at least one valid key",
    );
  }

  return [...new Set(validValues)];
}

async function listExistingKeyValues(keyValues: string[]) {
  const existingKeys = await GameKey.findAll({
    where: { keyValue: { [Op.in]: keyValues } },
    attributes: ["keyValue"],
  });

  return new Set(existingKeys.map((item) => String(item.get("keyValue"))));
}

export async function listGameKeys(query: ListGameKeysQuery) {
  const result = await GameKey.findAndCountAll({
    where: query.listingId ? { listingId: query.listingId } : undefined,
    limit: query.limit,
    offset: getPaginationOffset(query.page, query.limit),
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

  const keyValue = normalizeKeyValue(input.keyValue);
  const existing = await GameKey.findOne({ where: { keyValue } });

  if (existing) {
    throw new AppError(409, "GAME_KEY_ALREADY_EXISTS", "Game key already exists");
  }

  return GameKey.create({
    listingId: input.listingId,
    keyValue,
    status: "available",
  });
}

export async function bulkCreateGameKeys(input: BulkCreateGameKeysInput) {
  await findListingOrFail(input.listingId);

  const uniqueKeyValues = normalizeKeyValues(input.keyValues);
  const existingKeyValues = await listExistingKeyValues(uniqueKeyValues);
  const newKeys = uniqueKeyValues.filter((keyValue) => !existingKeyValues.has(keyValue));

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
    skippedCount: input.keyValues.map(normalizeKeyValue).filter(Boolean).length - newKeys.length,
    stock: await countListingStockSummary(input.listingId),
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
    stock: await countListingStockSummary(input.listingId),
  };
}
