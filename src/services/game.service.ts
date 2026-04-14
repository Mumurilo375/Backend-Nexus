import { Op, Transaction } from "sequelize";
import sequelize from "../config/database";
import Categories from "../models/Category";
import GameCategory from "../models/GameCategory";
import GameImages from "../models/Game_images";
import GamePlatformListing from "../models/GamePlatformListing";
import Games from "../models/Games";
import Platform from "../models/Platform";
import { AppError } from "../utils/app-error";
import { deleteManagedMediaList, isManagedMediaUrl } from "../utils/media-storage";
import { buildPaginationMeta, getPaginationOffset } from "../utils/pagination";
import { toNumber } from "../utils/money";
import { countListingStockSummary } from "../utils/stock";
import {
  AddGamePlatformKeysInput,
  UpdateGamePlatformInput,
} from "../validators/game-platform-admin.validator";
import {
  CreateGameInput,
  ListGamesQuery,
  UpdateGameInput,
} from "../validators/game.validator";
import {
  buildGameInclude,
  enrichPlatformListing,
  GAME_LIST_INCLUDE,
  JsonRecord,
  loadReviewStats,
  serializeGame,
} from "./catalog.shared";
import {
  buildGalleryItems,
  buildGalleryRows,
  buildGameUpdateFields,
  getManagedGameMediaUrls,
  replaceGameImages,
  saveCoverImage,
  saveGameImages,
  UploadedGameMedia,
} from "./game-media.shared";
import { deleteGameDependencies } from "./game-delete.shared";
import { bulkCreateGameKeys } from "./game-key.service";
import { createListingPriceChange } from "./listing-price-change.service";

const EMPTY_STOCK = { available: 0, reserved: 0, sold: 0, total: 0 };

function buildGamePlatformState(
  platform: Platform,
  listing: GamePlatformListing | null,
  stock = EMPTY_STOCK,
) {
  return {
    platform: {
      id: platform.id,
      name: platform.name,
      slug: platform.slug,
      iconUrl: platform.iconUrl,
      isActive: platform.isActive,
    },
    hasListing: Boolean(listing),
    listingId: listing?.id ?? null,
    price: listing ? toNumber(listing.price) : null,
    isActive: listing?.isActive ?? false,
    stock,
  };
}

async function findGameOrFail(id: number, transaction?: Transaction) {
  const game = await Games.findByPk(id, { transaction });

  if (!game) {
    throw new AppError(404, "GAME_NOT_FOUND", "Game not found");
  }

  return game;
}

async function findGameWithRelationsOrFail(id: number, activeListingsOnly = false) {
  const game = await Games.findByPk(id, {
    include: buildGameInclude(activeListingsOnly),
  });

  if (!game) {
    throw new AppError(404, "GAME_NOT_FOUND", "Game not found");
  }

  return game;
}

async function findPlatformOrFail(id: number, transaction?: Transaction) {
  const platform = await Platform.findByPk(id, { transaction });

  if (!platform) {
    throw new AppError(404, "PLATFORM_NOT_FOUND", "Platform not found");
  }

  return platform;
}

async function findListingByGameAndPlatform(
  gameId: number,
  platformId: number,
  transaction?: Transaction,
) {
  return GamePlatformListing.findOne({
    where: { gameId, platformId },
    transaction,
  });
}

async function validateCategoryIds(
  categoryIds: number[],
  transaction: Transaction,
) {
  const uniqueCategoryIds = [...new Set(categoryIds)];
  const categories = await Categories.findAll({
    where: { id: { [Op.in]: uniqueCategoryIds } },
    attributes: ["id"],
    transaction,
  });

  if (categories.length !== uniqueCategoryIds.length) {
    throw new AppError(400, "VALIDATION_ERROR", "One or more categories are invalid");
  }

  return uniqueCategoryIds;
}

async function replaceGameCategories(
  gameId: number,
  categoryIds: number[],
  transaction: Transaction,
) {
  await GameCategory.destroy({ where: { gameId }, transaction });
  await GameCategory.bulkCreate(
    categoryIds.map((categoryId) => ({ gameId, categoryId })),
    { transaction },
  );
}

function getRemovedGalleryMediaUrls(
  existingImages: GameImages[],
  keptImageIds: Set<number>,
) {
  return existingImages
    .filter(
      (image) => !keptImageIds.has(image.id) && isManagedMediaUrl(image.imageUrl),
    )
    .map((image) => image.imageUrl);
}

function getReplacedCoverMediaUrls(currentCoverImageUrl: string, nextCoverImageUrl: string) {
  if (
    currentCoverImageUrl &&
    currentCoverImageUrl !== nextCoverImageUrl &&
    isManagedMediaUrl(currentCoverImageUrl)
  ) {
    return [currentCoverImageUrl];
  }

  return [];
}

async function createGameInTransaction(
  input: CreateGameInput,
  uploadedGameMedia: UploadedGameMedia,
  createdMediaUrls: string[],
  transaction: Transaction,
) {
  const categoryIds = await validateCategoryIds(input.categoryIds, transaction);
  const game = await Games.create(
    {
      title: input.title,
      description: input.description,
      longDescription: input.longDescription,
      releaseDate: input.releaseDate,
      coverImageUrl: input.coverImageUrl || "__pending_cover__",
      isActive: input.isActive,
    },
    { transaction },
  );
  const coverImageUrl = await saveCoverImage({
    gameId: game.id,
    currentUrl: "",
    nextUrl: input.coverImageUrl,
    coverFile: uploadedGameMedia.coverFile,
    createdMediaUrls,
  });

  if (!coverImageUrl) {
    throw new AppError(400, "VALIDATION_ERROR", "cover image is required");
  }

  await Promise.all([
    game.update({ coverImageUrl }, { transaction }),
    replaceGameCategories(game.id, categoryIds, transaction),
  ]);

  const galleryItems = buildGalleryItems(
    input.galleryItems,
    uploadedGameMedia.galleryFiles ?? [],
  );

  if (galleryItems?.length) {
    const { rows } = await buildGalleryRows({
      gameId: game.id,
      galleryItems,
      galleryFiles: uploadedGameMedia.galleryFiles ?? [],
      existingImages: [],
      createdMediaUrls,
    });

    await saveGameImages(game.id, rows, transaction);
  }

  return game.id;
}

async function updateGameInTransaction(
  id: number,
  input: UpdateGameInput,
  uploadedGameMedia: UploadedGameMedia,
  createdMediaUrls: string[],
  transaction: Transaction,
) {
  const game = await findGameOrFail(id, transaction);
  const existingImages = await GameImages.findAll({
    where: { gameId: id },
    order: [["sortOrder", "ASC"], ["id", "ASC"]],
    transaction,
  });
  const currentCoverImageUrl = String(game.coverImageUrl ?? "").trim();

  if (input.categoryIds) {
    await replaceGameCategories(
      id,
      await validateCategoryIds(input.categoryIds, transaction),
      transaction,
    );
  }

  const coverImageUrl = await saveCoverImage({
    gameId: id,
    currentUrl: currentCoverImageUrl,
    nextUrl: input.coverImageUrl,
    coverFile: uploadedGameMedia.coverFile,
    createdMediaUrls,
  });

  if (!coverImageUrl) {
    throw new AppError(400, "VALIDATION_ERROR", "cover image is required");
  }

  const mediaUrlsToDelete = [...getReplacedCoverMediaUrls(currentCoverImageUrl, coverImageUrl)];
  const galleryItems = buildGalleryItems(
    input.galleryItems,
    uploadedGameMedia.galleryFiles ?? [],
  );

  if (galleryItems !== undefined) {
    const { rows, keptImageIds } = await buildGalleryRows({
      gameId: id,
      galleryItems,
      galleryFiles: uploadedGameMedia.galleryFiles ?? [],
      existingImages,
      createdMediaUrls,
    });

    mediaUrlsToDelete.push(...getRemovedGalleryMediaUrls(existingImages, keptImageIds));
    await replaceGameImages(id, rows, transaction);
  }

  await game.update(buildGameUpdateFields(input, coverImageUrl), { transaction });

  return mediaUrlsToDelete;
}

async function getGamePlatformState(gameId: number, platformId: number) {
  const [platform, listing] = await Promise.all([
    findPlatformOrFail(platformId),
    findListingByGameAndPlatform(gameId, platformId),
  ]);
  const stock = listing ? await countListingStockSummary(listing.id) : EMPTY_STOCK;

  return buildGamePlatformState(platform, listing, stock);
}

export async function listGames(query: ListGamesQuery) {
  const result = await Games.findAndCountAll({
    distinct: true,
    where: query.q
      ? {
          title: {
            [Op.iLike]: `%${query.q}%`,
          },
        }
      : undefined,
    limit: query.limit,
    offset: getPaginationOffset(query.page, query.limit),
    order: [["createdAt", "DESC"]],
    include: GAME_LIST_INCLUDE,
  });

  return {
    items: result.rows.map(serializeGame),
    meta: buildPaginationMeta(query, result.count),
  };
}

export async function getGameById(id: number) {
  return serializeGame(await findGameWithRelationsOrFail(id));
}

export async function getGameDetailsById(id: number) {
  const game = await findGameWithRelationsOrFail(id, true);
  const serializedGame = serializeGame(game) as JsonRecord;
  const platformListings = await Promise.all(
    ((serializedGame.platformListings as JsonRecord[] | undefined) ?? []).map(
      enrichPlatformListing,
    ),
  );

  return {
    ...serializedGame,
    platformListings,
    reviewStats: await loadReviewStats(id),
  };
}

export async function createGame(
  input: CreateGameInput,
  uploadedGameMedia: UploadedGameMedia = {},
) {
  const createdMediaUrls: string[] = [];

  try {
    const gameId = await sequelize.transaction((transaction) =>
      createGameInTransaction(input, uploadedGameMedia, createdMediaUrls, transaction),
    );

    return getGameById(gameId);
  } catch (error) {
    await deleteManagedMediaList(createdMediaUrls);
    throw error;
  }
}

export async function updateGame(
  id: number,
  input: UpdateGameInput,
  uploadedGameMedia: UploadedGameMedia = {},
) {
  const createdMediaUrls: string[] = [];

  try {
    const mediaUrlsToDelete = await sequelize.transaction((transaction) =>
      updateGameInTransaction(id, input, uploadedGameMedia, createdMediaUrls, transaction),
    );

    await deleteManagedMediaList(mediaUrlsToDelete);
    return getGameById(id);
  } catch (error) {
    await deleteManagedMediaList(createdMediaUrls);
    throw error;
  }
}

export async function deleteGame(id: number) {
  const mediaUrls = await sequelize.transaction(async (transaction) => {
    const game = await findGameOrFail(id, transaction);
    const images = await deleteGameDependencies(id, transaction);
    await game.destroy({ transaction });

    return getManagedGameMediaUrls(game, images);
  });

  await deleteManagedMediaList(mediaUrls);
}

export async function getGamePlatformsById(gameId: number) {
  const [game, platforms, listings] = await Promise.all([
    Games.findByPk(gameId, {
      attributes: ["id", "title", "coverImageUrl"],
    }),
    Platform.findAll({
      order: [["name", "ASC"]],
    }),
    GamePlatformListing.findAll({
      where: { gameId },
      order: [["id", "ASC"]],
    }),
  ]);

  if (!game) {
    throw new AppError(404, "GAME_NOT_FOUND", "Game not found");
  }

  const listingByPlatformId = new Map(
    listings.map((listing) => [listing.platformId, listing] as const),
  );
  const stockByPlatformId = new Map(
    await Promise.all(
      listings.map(
        async (listing) =>
          [listing.platformId, await countListingStockSummary(listing.id)] as const,
      ),
    ),
  );

  return {
    game: game.toJSON(),
    platforms: platforms.map((platform) =>
      buildGamePlatformState(
        platform,
        listingByPlatformId.get(platform.id) ?? null,
        stockByPlatformId.get(platform.id) ?? EMPTY_STOCK,
      ),
    ),
  };
}

export async function updateGamePlatform(
  gameId: number,
  platformId: number,
  input: UpdateGamePlatformInput,
  changedByUserId?: number,
) {
  await sequelize.transaction(async (transaction) => {
    await Promise.all([
      findGameOrFail(gameId, transaction),
      findPlatformOrFail(platformId, transaction),
    ]);

    const listing = await findListingByGameAndPlatform(
      gameId,
      platformId,
      transaction,
    );

    if (!listing) {
      if (input.price === undefined) {
        throw new AppError(
          400,
          "VALIDATION_ERROR",
          "price is required when configuring a new platform",
        );
      }

      const createdListing = await GamePlatformListing.create(
        {
          gameId,
          platformId,
          price: input.price,
          isActive: input.isActive ?? true,
        },
        { transaction },
      );

      await createListingPriceChange({
        listingId: createdListing.id,
        previousPrice: null,
        nextPrice: toNumber(input.price),
        changedByUserId,
        transaction,
      });

      return;
    }

    const previousPrice = toNumber(listing.price);
    const nextPrice = input.price === undefined ? previousPrice : toNumber(input.price);

    await listing.update(
      {
        price: nextPrice,
        isActive: input.isActive ?? listing.isActive,
      },
      { transaction },
    );

    if (input.price !== undefined && nextPrice !== previousPrice) {
      await createListingPriceChange({
        listingId: listing.id,
        previousPrice,
        nextPrice,
        changedByUserId,
        transaction,
      });
    }
  });

  return getGamePlatformState(gameId, platformId);
}

export async function addKeysToGamePlatform(
  gameId: number,
  platformId: number,
  input: AddGamePlatformKeysInput,
) {
  await Promise.all([findGameOrFail(gameId), findPlatformOrFail(platformId)]);

  const listing = await findListingByGameAndPlatform(gameId, platformId);

  if (!listing) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "Configure the platform before adding keys",
    );
  }

  return {
    listingId: listing.id,
    ...(await bulkCreateGameKeys({
      listingId: listing.id,
      keyValues: input.keyValues,
    })),
  };
}
