import sequelize from "../config/database";
import GamePlatformListing from "../models/GamePlatformListing";
import Games from "../models/Games";
import Platform from "../models/Platform";
import { AppError } from "../utils/app-error";
import { buildPricingFromPromotions, toNumber } from "../utils/money";
import { buildPaginationMeta, getPaginationOffset } from "../utils/pagination";
import { countListingStockSummary } from "../utils/stock";
import { PlainObject } from "../utils/value-types";
import {
  CreateListingInput,
  ListListingsQuery,
  UpdateListingInput,
} from "../validators/listing.validator";
import {
  asRecordArray,
  LISTING_DETAILS_INCLUDE,
  LISTING_INCLUDE,
  listActivePromotions,
  loadReviewStats,
  sortImages,
  sortPlatformListings,
} from "./catalog.shared";
import { createListingPriceChange } from "./listing-price-change.service";

async function findListingOrFail(id: number): Promise<GamePlatformListing> {
  const listing = await GamePlatformListing.findByPk(id);

  if (!listing) {
    throw new AppError(404, "LISTING_NOT_FOUND", "Listing not found");
  }

  return listing;
}

async function ensureListingDependencies(input: CreateListingInput) {
  const [game, platform, existingListing] = await Promise.all([
    Games.findByPk(input.gameId),
    Platform.findByPk(input.platformId),
    GamePlatformListing.findOne({
      where: { gameId: input.gameId, platformId: input.platformId },
    }),
  ]);

  if (!game) {
    throw new AppError(404, "GAME_NOT_FOUND", "Game not found");
  }

  if (!platform) {
    throw new AppError(404, "PLATFORM_NOT_FOUND", "Platform not found");
  }

  if (existingListing) {
    throw new AppError(
      409,
      "LISTING_ALREADY_EXISTS",
      "Listing already exists for this game and platform",
    );
  }
}

function serializeListingGame(game: PlainObject | undefined) {
  if (!game) {
    return null;
  }

  return {
    ...game,
    images: sortImages(asRecordArray(game.images)),
    platformListings: sortPlatformListings(asRecordArray(game.platformListings)),
  };
}

export async function listListings(query: ListListingsQuery) {
  const result = await GamePlatformListing.findAndCountAll({
    where: query.gameId ? { gameId: query.gameId } : undefined,
    limit: query.limit,
    offset: getPaginationOffset(query.page, query.limit),
    order: [["id", "DESC"]],
    include: LISTING_INCLUDE,
  });

  const items = query.includeStock
    ? await Promise.all(
        result.rows.map(async (listing) => ({
          ...listing.toJSON(),
          stock: await countListingStockSummary(listing.id),
        })),
      )
    : result.rows;

  return {
    items,
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

export async function getListingStockById(id: number) {
  await findListingOrFail(id);

  return {
    listingId: id,
    stock: await countListingStockSummary(id),
  };
}

export async function getListingDetailsById(id: number) {
  const listing = await GamePlatformListing.findByPk(id, {
    include: LISTING_DETAILS_INCLUDE,
  });

  if (!listing) {
    throw new AppError(404, "LISTING_NOT_FOUND", "Listing not found");
  }

  const listingData = listing.toJSON() as PlainObject;
  const game = listingData.game as PlainObject | undefined;
  const gameId = toNumber(listing.get("gameId"));
  const [stock, reviewStats, activePromotions] = await Promise.all([
    countListingStockSummary(id),
    loadReviewStats(gameId),
    listActivePromotions(id),
  ]);

  return {
    ...listingData,
    game: serializeListingGame(game),
    activePromotions,
    pricing: buildPricingFromPromotions(listingData.price, activePromotions),
    stock,
    reviewStats,
  };
}

export async function createListing(
  input: CreateListingInput,
  changedByUserId?: number,
) {
  await ensureListingDependencies(input);

  return sequelize.transaction(async (transaction) => {
    const listing = await GamePlatformListing.create(
      {
        gameId: input.gameId,
        platformId: input.platformId,
        price: input.price,
        isActive: true,
      },
      { transaction },
    );

    await createListingPriceChange({
      listingId: listing.id,
      previousPrice: null,
      nextPrice: toNumber(input.price),
      changedByUserId,
      transaction,
    });

    return listing;
  });
}

export async function updateListing(
  id: number,
  input: UpdateListingInput,
  changedByUserId?: number,
) {
  return sequelize.transaction(async (transaction) => {
    const listing = await GamePlatformListing.findByPk(id, { transaction });

    if (!listing) {
      throw new AppError(404, "LISTING_NOT_FOUND", "Listing not found");
    }

    const previousPrice = toNumber(listing.price);
    const nextPrice = input.price === undefined ? previousPrice : toNumber(input.price);

    await listing.update(input, { transaction });

    if (input.price !== undefined && nextPrice !== previousPrice) {
      await createListingPriceChange({
        listingId: listing.id,
        previousPrice,
        nextPrice,
        changedByUserId,
        transaction,
      });
    }

    return listing;
  });
}

export async function deleteListing(id: number) {
  const listing = await findListingOrFail(id);
  await listing.destroy();
}
