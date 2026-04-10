import { col, fn, Op, Transaction } from "sequelize";
import sequelize from "../config/database";
import Categories from "../models/Category";
import GameCategory from "../models/GameCategory";
import GameImages from "../models/Game_images";
import GamePlatformListing from "../models/GamePlatformListing";
import Games from "../models/Games";
import Platform from "../models/Platform";
import Promotion from "../models/Promotion";
import PromotionListing from "../models/PromotionListing";
import Review from "../models/Review";
import Tags from "../models/Tags";
import { AppError } from "../utils/app-error";
import {
  deleteManagedMediaList,
  isManagedMediaUrl,
  moveUploadedGameImage,
} from "../utils/media-storage";
import { countListingStockSummary } from "../utils/stock";
import {
  AddGamePlatformKeysInput,
  UpdateGamePlatformInput,
} from "../validators/game-platform-admin.validator";
import {
  CreateGameInput,
  GameGalleryItemInput,
  ListGamesQuery,
  UpdateGameInput,
} from "../validators/game.validator";
import { bulkCreateGameKeys } from "./game-key.service";
import { createListingPriceChange } from "./listing-price-change.service";

type UploadedGameMedia = {
  coverFile?: Express.Multer.File | null;
  galleryFiles?: Express.Multer.File[];
};

type PlainRecord = Record<string, unknown>;

const gameAdminInclude = [
  { model: Categories, as: "categories", through: { attributes: [] } },
  { model: Tags, as: "tags", through: { attributes: [] } },
  { model: GameImages, as: "images", required: false },
  {
    model: GamePlatformListing,
    as: "platformListings",
    required: false,
    include: [{ model: Platform, as: "platform" }],
  },
];

const gameDetailsInclude = [
  { model: Categories, as: "categories", through: { attributes: [] } },
  { model: Tags, as: "tags", through: { attributes: [] } },
  { model: GameImages, as: "images", required: false },
  {
    model: GamePlatformListing,
    as: "platformListings",
    required: false,
    where: { isActive: true },
    include: [{ model: Platform, as: "platform" }],
  },
];

function asRecordArray(value: unknown) {
  return Array.isArray(value) ? (value as PlainRecord[]) : [];
}

function toMoneyNumber(value: unknown) {
  return Number(value) || 0;
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function sortImages(images: PlainRecord[]) {
  return [...images].sort((firstImage, secondImage) => {
    const firstSortOrder = Number(firstImage.sortOrder ?? 0);
    const secondSortOrder = Number(secondImage.sortOrder ?? 0);

    if (firstSortOrder !== secondSortOrder) {
      return firstSortOrder - secondSortOrder;
    }

    return Number(firstImage.id ?? 0) - Number(secondImage.id ?? 0);
  });
}

function sortNamedItems(items: PlainRecord[]) {
  return [...items].sort((firstItem, secondItem) =>
    String(firstItem.name ?? "").localeCompare(String(secondItem.name ?? ""), "pt-BR"),
  );
}

function sortPlatformListings(listings: PlainRecord[]) {
  return [...listings].sort(
    (firstListing, secondListing) =>
      toMoneyNumber(firstListing.price) - toMoneyNumber(secondListing.price),
  );
}

function normalizeGame(game: Games) {
  const gameData = game.toJSON() as PlainRecord;

  return {
    ...gameData,
    categories: sortNamedItems(asRecordArray(gameData.categories)),
    tags: sortNamedItems(asRecordArray(gameData.tags)),
    images: sortImages(asRecordArray(gameData.images)),
    platformListings: sortPlatformListings(asRecordArray(gameData.platformListings)),
  };
}

async function findGameOrFail(id: number, transaction?: Transaction) {
  const game = await Games.findByPk(id, { transaction });

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

async function ensureCategoriesExist(categoryIds: number[], transaction: Transaction) {
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

async function syncGameCategories(
  gameId: number,
  categoryIds: number[],
  transaction: Transaction,
) {
  await GameCategory.destroy({
    where: { gameId },
    transaction,
  });

  await GameCategory.bulkCreate(
    categoryIds.map((categoryId) => ({
      gameId,
      categoryId,
    })),
    { transaction },
  );
}

function buildEffectiveGalleryItems(
  galleryItems: GameGalleryItemInput[] | undefined,
  galleryFiles: Express.Multer.File[],
) {
  if (galleryItems !== undefined) {
    return galleryItems;
  }

  if (galleryFiles.length === 0) {
    return undefined;
  }

  return galleryFiles.map((_, fileIndex) => ({
    kind: "file" as const,
    fileIndex,
  }));
}

async function resolveCoverImageUrl(
  gameId: number,
  currentCoverImageUrl: string | null | undefined,
  nextCoverImageUrl: string | null | undefined,
  coverFile: Express.Multer.File | null | undefined,
  createdManagedMediaUrls: string[],
) {
  if (coverFile) {
    const managedCoverImageUrl = await moveUploadedGameImage(coverFile, {
      gameId,
      kind: "cover",
    });

    createdManagedMediaUrls.push(managedCoverImageUrl);
    return managedCoverImageUrl;
  }

  return String(nextCoverImageUrl ?? currentCoverImageUrl ?? "").trim();
}

async function resolveGalleryImageRows(
  gameId: number,
  galleryItems: GameGalleryItemInput[],
  galleryFiles: Express.Multer.File[],
  existingImages: GameImages[],
  createdManagedMediaUrls: string[],
) {
  const existingImageById = new Map(existingImages.map((image) => [image.id, image]));
  const retainedImageIds = new Set<number>();
  const imageRows: Array<{ imageUrl: string; sortOrder: number }> = [];

  for (const galleryItem of galleryItems) {
    if (galleryItem.kind === "existing") {
      const existingImage = existingImageById.get(galleryItem.id ?? 0);

      if (!existingImage) {
        throw new AppError(400, "VALIDATION_ERROR", "Gallery item no longer exists");
      }

      retainedImageIds.add(existingImage.id);
      imageRows.push({
        imageUrl: existingImage.imageUrl,
        sortOrder: imageRows.length,
      });
      continue;
    }

    if (galleryItem.kind === "file") {
      const galleryFile = galleryFiles[galleryItem.fileIndex ?? -1];

      if (!galleryFile) {
        throw new AppError(400, "VALIDATION_ERROR", "Gallery file is missing");
      }

      const managedGalleryImageUrl = await moveUploadedGameImage(galleryFile, {
        gameId,
        kind: "gallery",
      });

      createdManagedMediaUrls.push(managedGalleryImageUrl);
      imageRows.push({
        imageUrl: managedGalleryImageUrl,
        sortOrder: imageRows.length,
      });
      continue;
    }

    imageRows.push({
      imageUrl: String(galleryItem.url ?? "").trim(),
      sortOrder: imageRows.length,
    });
  }

  return { imageRows, retainedImageIds };
}

function emptyStockSummary() {
  return {
    available: 0,
    reserved: 0,
    sold: 0,
    total: 0,
  };
}

async function getActivePromotionsByListingId(listingId: number) {
  const now = new Date();

  const promotionLinks = await PromotionListing.findAll({
    where: { listingId },
    include: [
      {
        model: Promotion,
        as: "promotion",
        attributes: [
          "id",
          "name",
          "description",
          "discountPercentage",
          "startDate",
          "endDate",
          "isActive",
        ],
        required: true,
        where: {
          isActive: true,
          startDate: { [Op.lte]: now },
          endDate: { [Op.gte]: now },
        },
      },
    ],
    order: [["id", "DESC"]],
  });

  return promotionLinks
    .map((promotionLink) => promotionLink.get("promotion") as Promotion | undefined)
    .filter((promotion): promotion is Promotion => Boolean(promotion))
    .map((promotion) => promotion.toJSON());
}

async function enrichPlatformListing(listing: PlainRecord) {
  const listingId = Number(listing.id ?? 0);
  const [stock, activePromotions] = await Promise.all([
    countListingStockSummary(listingId),
    getActivePromotionsByListingId(listingId),
  ]);

  const highestDiscountPercentage = activePromotions.reduce((highestDiscount, promotion) => {
    const discount = toMoneyNumber(
      (promotion as Record<string, unknown>).discountPercentage,
    );

    return discount > highestDiscount ? discount : highestDiscount;
  }, 0);

  const basePrice = toMoneyNumber(listing.price);
  const discountAmount = roundMoney((basePrice * highestDiscountPercentage) / 100);
  const finalPrice = roundMoney(basePrice - discountAmount);

  return {
    ...listing,
    activePromotions,
    pricing: {
      basePrice,
      discountPercentage: highestDiscountPercentage,
      discountAmount,
      finalPrice,
      hasDiscount: highestDiscountPercentage > 0,
    },
    stock,
  };
}

function buildGamePlatformState(
  platform: Platform,
  listing: GamePlatformListing | null,
  stock = emptyStockSummary(),
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
    price: listing ? toMoneyNumber(listing.price) : null,
    isActive: listing?.isActive ?? false,
    stock,
  };
}

async function getGamePlatformState(gameId: number, platformId: number) {
  const [platform, listing] = await Promise.all([
    findPlatformOrFail(platformId),
    findListingByGameAndPlatform(gameId, platformId),
  ]);

  const stock = listing ? await countListingStockSummary(listing.id) : emptyStockSummary();
  return buildGamePlatformState(platform, listing, stock);
}

export async function listGames(query: ListGamesQuery) {
  const offset = (query.page - 1) * query.limit;

  const result = await Games.findAndCountAll({
    where: query.q
      ? {
          title: {
            [Op.iLike]: `%${query.q}%`,
          },
        }
      : undefined,
    limit: query.limit,
    offset,
    order: [["createdAt", "DESC"]],
    include: [
      { model: Categories, as: "categories", through: { attributes: [] } },
      { model: Tags, as: "tags", through: { attributes: [] } },
    ],
  });

  return {
    items: result.rows.map(normalizeGame),
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
    include: gameAdminInclude,
  });

  if (!game) {
    throw new AppError(404, "GAME_NOT_FOUND", "Game not found");
  }

  return normalizeGame(game);
}

export async function getGameDetailsById(id: number) {
  const game = await Games.findByPk(id, {
    include: gameDetailsInclude,
  });

  if (!game) {
    throw new AppError(404, "GAME_NOT_FOUND", "Game not found");
  }

  const gameData = normalizeGame(game) as PlainRecord;
  const rawPlatformListings = asRecordArray(gameData.platformListings);

  const [reviewsCount, averageRatingRow, platformListings] = await Promise.all([
    Review.count({ where: { gameId: id } }),
    (Review.findOne({
      where: { gameId: id },
      attributes: [[fn("AVG", col("rating")), "averageRating"]],
      raw: true,
    }) as Promise<{ averageRating: string | null } | null>),
    Promise.all(
      sortPlatformListings(rawPlatformListings).map((listing) =>
        enrichPlatformListing(listing),
      ),
    ),
  ]);

  const averageRating = toMoneyNumber(averageRatingRow?.averageRating);

  return {
    ...gameData,
    platformListings,
    reviewStats: {
      totalReviews: reviewsCount,
      averageRating: Number(averageRating.toFixed(1)),
    },
  };
}

export async function createGame(input: CreateGameInput, uploadedGameMedia: UploadedGameMedia = {}) {
  const transaction = await sequelize.transaction();
  const createdManagedMediaUrls: string[] = [];

  try {
    const categoryIds = await ensureCategoriesExist(input.categoryIds, transaction);
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

    const coverImageUrl = await resolveCoverImageUrl(
      game.id,
      "",
      input.coverImageUrl,
      uploadedGameMedia.coverFile,
      createdManagedMediaUrls,
    );

    if (!coverImageUrl) {
      throw new AppError(400, "VALIDATION_ERROR", "cover image is required");
    }

    await game.update({ coverImageUrl }, { transaction });
    await syncGameCategories(game.id, categoryIds, transaction);

    const effectiveGalleryItems =
      buildEffectiveGalleryItems(input.galleryItems, uploadedGameMedia.galleryFiles ?? []) ?? [];

    if (effectiveGalleryItems.length > 0) {
      const { imageRows } = await resolveGalleryImageRows(
        game.id,
        effectiveGalleryItems,
        uploadedGameMedia.galleryFiles ?? [],
        [],
        createdManagedMediaUrls,
      );

      await GameImages.bulkCreate(
        imageRows.map((imageRow) => ({
          gameId: game.id,
          imageUrl: imageRow.imageUrl,
          sortOrder: imageRow.sortOrder,
        })),
        { transaction },
      );
    }

    await transaction.commit();
    return getGameById(game.id);
  } catch (error) {
    await transaction.rollback();
    await deleteManagedMediaList(createdManagedMediaUrls);
    throw error;
  }
}

export async function updateGame(
  id: number,
  input: UpdateGameInput,
  uploadedGameMedia: UploadedGameMedia = {},
) {
  const transaction = await sequelize.transaction();
  const createdManagedMediaUrls: string[] = [];
  const managedMediaUrlsToDelete: string[] = [];

  try {
    const game = await findGameOrFail(id, transaction);
    const existingImages = await GameImages.findAll({
      where: { gameId: id },
      order: [["sortOrder", "ASC"], ["id", "ASC"]],
      transaction,
    });
    const previousCoverImageUrl = String(game.coverImageUrl ?? "").trim();

    if (input.categoryIds) {
      const categoryIds = await ensureCategoriesExist(input.categoryIds, transaction);
      await syncGameCategories(id, categoryIds, transaction);
    }

    const coverImageUrl = await resolveCoverImageUrl(
      id,
      previousCoverImageUrl,
      input.coverImageUrl,
      uploadedGameMedia.coverFile,
      createdManagedMediaUrls,
    );

    if (!coverImageUrl) {
      throw new AppError(400, "VALIDATION_ERROR", "cover image is required");
    }

    const effectiveGalleryItems = buildEffectiveGalleryItems(
      input.galleryItems,
      uploadedGameMedia.galleryFiles ?? [],
    );

    if (effectiveGalleryItems !== undefined) {
      const { imageRows, retainedImageIds } = await resolveGalleryImageRows(
        id,
        effectiveGalleryItems,
        uploadedGameMedia.galleryFiles ?? [],
        existingImages,
        createdManagedMediaUrls,
      );

      managedMediaUrlsToDelete.push(
        ...existingImages
          .filter((image) => !retainedImageIds.has(image.id) && isManagedMediaUrl(image.imageUrl))
          .map((image) => image.imageUrl),
      );

      await GameImages.destroy({
        where: { gameId: id },
        transaction,
      });

      if (imageRows.length > 0) {
        await GameImages.bulkCreate(
          imageRows.map((imageRow) => ({
            gameId: id,
            imageUrl: imageRow.imageUrl,
            sortOrder: imageRow.sortOrder,
          })),
          { transaction },
        );
      }
    }

    if (coverImageUrl !== previousCoverImageUrl && isManagedMediaUrl(previousCoverImageUrl)) {
      managedMediaUrlsToDelete.push(previousCoverImageUrl);
    }

    const updatePayload: Record<string, unknown> = {
      coverImageUrl,
    };

    if (input.title !== undefined) {
      updatePayload.title = input.title;
    }
    if (input.description !== undefined) {
      updatePayload.description = input.description;
    }
    if (input.longDescription !== undefined) {
      updatePayload.longDescription = input.longDescription;
    }
    if (input.releaseDate !== undefined) {
      updatePayload.releaseDate = input.releaseDate;
    }
    if (input.isActive !== undefined) {
      updatePayload.isActive = input.isActive;
    }

    await game.update(updatePayload, { transaction });
    await transaction.commit();
    await deleteManagedMediaList(managedMediaUrlsToDelete);

    return getGameById(id);
  } catch (error) {
    await transaction.rollback();
    await deleteManagedMediaList(createdManagedMediaUrls);
    throw error;
  }
}

export async function deleteGame(id: number) {
  const transaction = await sequelize.transaction();

  try {
    const game = await findGameOrFail(id, transaction);
    const images = await GameImages.findAll({
      where: { gameId: id },
      transaction,
    });
    const managedMediaUrls = [
      String(game.coverImageUrl ?? "").trim(),
      ...images.map((image) => image.imageUrl),
    ].filter((value) => isManagedMediaUrl(value));

    await GameImages.destroy({
      where: { gameId: id },
      transaction,
    });
    await GameCategory.destroy({
      where: { gameId: id },
      transaction,
    });
    await game.destroy({ transaction });
    await transaction.commit();
    await deleteManagedMediaList(managedMediaUrls);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
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

  const listingByPlatformId = new Map(listings.map((listing) => [listing.platformId, listing]));
  const stockEntries = await Promise.all(
    listings.map(async (listing) => [listing.platformId, await countListingStockSummary(listing.id)] as const),
  );
  const stockByPlatformId = new Map(stockEntries);

  return {
    game: game.toJSON(),
    platforms: platforms.map((platform) =>
      buildGamePlatformState(
        platform,
        listingByPlatformId.get(platform.id) ?? null,
        stockByPlatformId.get(platform.id) ?? emptyStockSummary(),
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
  const transaction = await sequelize.transaction();

  try {
    await Promise.all([
      findGameOrFail(gameId, transaction),
      findPlatformOrFail(platformId, transaction),
    ]);

    const existingListing = await findListingByGameAndPlatform(
      gameId,
      platformId,
      transaction,
    );

    if (!existingListing) {
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
        nextPrice: Number(input.price),
        changedByUserId,
        transaction,
      });
    } else {
      const previousPrice = Number(existingListing.price);
      const nextPrice =
        input.price === undefined ? previousPrice : Number(input.price);

      await existingListing.update(
        {
          price: input.price ?? existingListing.price,
          isActive: input.isActive ?? existingListing.isActive,
        },
        { transaction },
      );

      if (input.price !== undefined && nextPrice !== previousPrice) {
        await createListingPriceChange({
          listingId: existingListing.id,
          previousPrice,
          nextPrice,
          changedByUserId,
          transaction,
        });
      }
    }

    await transaction.commit();
    return getGamePlatformState(gameId, platformId);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function addKeysToGamePlatform(
  gameId: number,
  platformId: number,
  input: AddGamePlatformKeysInput,
) {
  await findGameOrFail(gameId);
  await findPlatformOrFail(platformId);

  const listing = await findListingByGameAndPlatform(gameId, platformId);

  if (!listing) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "Configure the platform before adding keys",
    );
  }

  const result = await bulkCreateGameKeys({
    listingId: listing.id,
    keyValues: input.keyValues,
  });

  return {
    listingId: listing.id,
    ...result,
  };
}
