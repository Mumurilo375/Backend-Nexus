import GamePlatformListing from "../models/GamePlatformListing";
import Games from "../models/Games";
import Platform from "../models/Platform";
import { AppError } from "../utils/app-error";
import { buildPaginationMeta, getPaginationOffset } from "../utils/pagination";
import { CreateListingInput, ListListingsQuery, UpdateListingInput } from "../validators/listing.validator";

const LISTING_INCLUDE = [
  { model: Games, as: "game" },
  { model: Platform, as: "platform" },
];

async function findListingOrFail(id: number): Promise<GamePlatformListing> {
  const listing = await GamePlatformListing.findByPk(id);
  if (!listing) {
    throw new AppError(404, "LISTING_NOT_FOUND", "Listing not found");
  }
  return listing;
}

export async function listListings(query: ListListingsQuery) {
  const offset = getPaginationOffset(query.page, query.limit);

  const result = await GamePlatformListing.findAndCountAll({
    limit: query.limit,
    offset,
    order: [["id", "DESC"]],
    include: LISTING_INCLUDE,
  });

  return {
    items: result.rows,
    meta: buildPaginationMeta(query, result.count),
  };
}

export async function getListingById(id: number) {
  const listing = await GamePlatformListing.findByPk(id, {
    include: LISTING_INCLUDE,
  });

  if (!listing) {
    throw new AppError(404, "LISTING_NOT_FOUND", "Listing not found");
  }

  return listing;
}

export async function createListing(input: CreateListingInput) {
  const game = await Games.findByPk(input.gameId);
  if (!game) {
    throw new AppError(404, "GAME_NOT_FOUND", "Game not found");
  }

  const platform = await Platform.findByPk(input.platformId);
  if (!platform) {
    throw new AppError(404, "PLATFORM_NOT_FOUND", "Platform not found");
  }

  const existing = await GamePlatformListing.findOne({
    where: { gameId: input.gameId, platformId: input.platformId },
  });

  if (existing) {
    throw new AppError(409, "LISTING_ALREADY_EXISTS", "Listing already exists for this game and platform");
  }

  return GamePlatformListing.create({
    gameId: input.gameId,
    platformId: input.platformId,
    price: input.price,
    isActive: true,
  });
}

export async function updateListing(id: number, input: UpdateListingInput) {
  const listing = await findListingOrFail(id);
  await listing.update(input);
  return listing;
}

export async function deleteListing(id: number) {
  const listing = await findListingOrFail(id);
  await listing.destroy();
}
