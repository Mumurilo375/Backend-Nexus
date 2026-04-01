import GamePlatformListing from "../models/GamePlatformListing";
import GameKey from "../models/GameKey";
import Games from "../models/Games";
import Platform from "../models/Platform";
import Categories from "../models/Category";
import Tags from "../models/Tags";
import GameImages from "../models/Game_images";
import Review from "../models/Review";
import Promotion from "../models/Promotion";
import PromotionListing from "../models/PromotionListing";
import { col, fn, Op } from "sequelize";
import { AppError } from "../utils/app-error";
import { buildPaginationMeta, getPaginationOffset } from "../utils/pagination";
import {
  CreateListingInput,
  ListListingsQuery,
  UpdateListingInput,
} from "../validators/listing.validator";

const LISTING_INCLUDE = [
  { model: Games, as: "game" },
  { model: Platform, as: "platform" },
];

const LISTING_DETAILS_INCLUDE = [
  {
    model: Games,
    as: "game",
    include: [
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
    ],
  },
  { model: Platform, as: "platform" },
];

function toMoneyNumber(value: unknown): number {
  return Number(value) || 0;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

async function countListingStock(listingId: number) {
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

export async function getListingStockById(id: number) {
  await findListingOrFail(id);
  const stock = await countListingStock(id);

  return {
    listingId: id,
    stock,
  };
}

export async function getListingDetailsById(id: number) {
  const listing = await GamePlatformListing.findByPk(id, {
    include: LISTING_DETAILS_INCLUDE,
  });

  if (!listing) {
    throw new AppError(404, "LISTING_NOT_FOUND", "Listing not found");
  }

  const listingData = listing.toJSON() as Record<string, unknown>;
  const game =
    (listingData.game as Record<string, unknown> | undefined) ?? undefined;
  const gameId = Number(listing.get("gameId"));

  const now = new Date();

  const [stock, reviewsCount, averageRatingRow, promotionLinks] =
    await Promise.all([
      countListingStock(id),
      Review.count({ where: { gameId } }),
      Review.findOne({
        where: { gameId },
        attributes: [[fn("AVG", col("rating")), "averageRating"]],
        raw: true,
      }) as Promise<{ averageRating: string | null } | null>,
      PromotionListing.findAll({
        where: { listingId: id },
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
      }),
    ]);

  const activePromotions = promotionLinks
    .map((link) => link.get("promotion") as Promotion | undefined)
    .filter((promotion): promotion is Promotion => Boolean(promotion))
    .map((promotion) => promotion.toJSON());

  const maxDiscountPercentage = activePromotions.reduce((max, promotion) => {
    const discount = toMoneyNumber(
      (promotion as Record<string, unknown>).discountPercentage,
    );
    return discount > max ? discount : max;
  }, 0);

  const basePrice = toMoneyNumber(listingData.price);
  const discountAmount = roundMoney((basePrice * maxDiscountPercentage) / 100);
  const finalPrice = roundMoney(basePrice - discountAmount);

  const averageRating = toMoneyNumber(averageRatingRow?.averageRating);

  const sortedImages = Array.isArray(game?.images)
    ? [...(game.images as Array<Record<string, unknown>>)].sort((a, b) => {
        const sortA = Number(a.sortOrder ?? 0);
        const sortB = Number(b.sortOrder ?? 0);
        if (sortA !== sortB) {
          return sortA - sortB;
        }
        return Number(a.id ?? 0) - Number(b.id ?? 0);
      })
    : [];

  const sortedPlatformListings = Array.isArray(game?.platformListings)
    ? [...(game.platformListings as Array<Record<string, unknown>>)].sort(
        (a, b) => toMoneyNumber(a.price) - toMoneyNumber(b.price),
      )
    : [];

  return {
    ...listingData,
    game: game
      ? {
          ...game,
          images: sortedImages,
          platformListings: sortedPlatformListings,
        }
      : null,
    activePromotions,
    pricing: {
      basePrice,
      discountPercentage: maxDiscountPercentage,
      discountAmount,
      finalPrice,
      hasDiscount: maxDiscountPercentage > 0,
    },
    stock,
    reviewStats: {
      totalReviews: reviewsCount,
      averageRating: Number(averageRating.toFixed(1)),
    },
  };
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
    throw new AppError(
      409,
      "LISTING_ALREADY_EXISTS",
      "Listing already exists for this game and platform",
    );
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
