import { col, fn, Op } from "sequelize";
import Games from "../models/Games";
import Categories from "../models/Category";
import Tags from "../models/Tags";
import GamePlatformListing from "../models/GamePlatformListing";
import Platform from "../models/Platform";
import GameImages from "../models/Game_images";
import GameKey from "../models/GameKey";
import Promotion from "../models/Promotion";
import PromotionListing from "../models/PromotionListing";
import Review from "../models/Review";
import { AppError } from "../utils/app-error";
import { CreateGameInput, ListGamesQuery, UpdateGameInput } from "../validators/game.validator";

async function findGameOrFail(id: number): Promise<Games> {
  const game = await Games.findByPk(id);
  if (!game) {
    throw new AppError(404, "GAME_NOT_FOUND", "Game not found");
  }
  return game;
}

const GAME_DETAILS_INCLUDE = [
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
    .map((link) => link.get("promotion") as Promotion | undefined)
    .filter((promotion): promotion is Promotion => Boolean(promotion))
    .map((promotion) => promotion.toJSON());
}

function sortImages(images: Array<Record<string, unknown>>) {
  return [...images].sort((a, b) => {
    const sortA = Number(a.sortOrder ?? 0);
    const sortB = Number(b.sortOrder ?? 0);
    if (sortA !== sortB) {
      return sortA - sortB;
    }

    return Number(a.id ?? 0) - Number(b.id ?? 0);
  });
}

function sortPlatformListings(listings: Array<Record<string, unknown>>) {
  return [...listings].sort(
    (a, b) => toMoneyNumber(a.price) - toMoneyNumber(b.price),
  );
}

async function enrichPlatformListing(listing: Record<string, unknown>) {
  const listingId = Number(listing.id ?? 0);
  const [stock, activePromotions] = await Promise.all([
    countListingStock(listingId),
    getActivePromotionsByListingId(listingId),
  ]);

  const maxDiscountPercentage = activePromotions.reduce((max, promotion) => {
    const discount = toMoneyNumber(
      (promotion as Record<string, unknown>).discountPercentage,
    );
    return discount > max ? discount : max;
  }, 0);

  const basePrice = toMoneyNumber(listing.price);
  const discountAmount = roundMoney((basePrice * maxDiscountPercentage) / 100);
  const finalPrice = roundMoney(basePrice - discountAmount);

  return {
    ...listing,
    activePromotions,
    pricing: {
      basePrice,
      discountPercentage: maxDiscountPercentage,
      discountAmount,
      finalPrice,
      hasDiscount: maxDiscountPercentage > 0,
    },
    stock,
  };
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

export async function getGameDetailsById(id: number) {
  const game = await Games.findByPk(id, {
    include: GAME_DETAILS_INCLUDE,
  });

  if (!game) {
    throw new AppError(404, "GAME_NOT_FOUND", "Game not found");
  }

  const gameData = game.toJSON() as Record<string, unknown>;
  const rawImages = Array.isArray(gameData.images)
    ? (gameData.images as Array<Record<string, unknown>>)
    : [];
  const rawPlatformListings = Array.isArray(gameData.platformListings)
    ? (gameData.platformListings as Array<Record<string, unknown>>)
    : [];

  const [reviewsCount, averageRatingRow, platformListings] = await Promise.all([
    Review.count({ where: { gameId: id } }),
    Review.findOne({
      where: { gameId: id },
      attributes: [[fn("AVG", col("rating")), "averageRating"]],
      raw: true,
    }) as Promise<{ averageRating: string | null } | null>,
    Promise.all(
      sortPlatformListings(rawPlatformListings).map((listing) =>
        enrichPlatformListing(listing),
      ),
    ),
  ]);

  const averageRating = toMoneyNumber(averageRatingRow?.averageRating);

  return {
    ...gameData,
    images: sortImages(rawImages),
    platformListings,
    reviewStats: {
      totalReviews: reviewsCount,
      averageRating: Number(averageRating.toFixed(1)),
    },
  };
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
