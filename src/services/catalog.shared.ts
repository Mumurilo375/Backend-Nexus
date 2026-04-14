import { col, fn, Op, Transaction } from "sequelize";
import Categories from "../models/Category";
import GameImages from "../models/Game_images";
import GamePlatformListing from "../models/GamePlatformListing";
import Games from "../models/Games";
import Platform from "../models/Platform";
import Promotion from "../models/Promotion";
import PromotionListing from "../models/PromotionListing";
import Review from "../models/Review";
import Tags from "../models/Tags";
import { buildPricingFromPromotions, getMaxDiscountPercentage, toNumber } from "../utils/money";
import { countListingStockSummary } from "../utils/stock";
import { PlainObject, PlainValue } from "../utils/value-types";

export type JsonRecord = PlainObject;

export const GAME_LIST_INCLUDE = [
  { model: Categories, as: "categories", through: { attributes: [] } },
  { model: Tags, as: "tags", through: { attributes: [] } },
];

export function buildGameInclude(activeListingsOnly = false) {
  return [
    ...GAME_LIST_INCLUDE,
    { model: GameImages, as: "images", required: false },
    {
      model: GamePlatformListing,
      as: "platformListings",
      required: false,
      ...(activeListingsOnly ? { where: { isActive: true } } : {}),
      include: [{ model: Platform, as: "platform" }],
    },
  ];
}

export const LISTING_INCLUDE = [
  { model: Games, as: "game" },
  { model: Platform, as: "platform" },
];

export const LISTING_DETAILS_INCLUDE = [
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

export function asRecordArray(value: PlainValue): JsonRecord[] {
  return Array.isArray(value) ? (value as JsonRecord[]) : [];
}

export function sortNamedItems(items: JsonRecord[]): JsonRecord[] {
  return [...items].sort((firstItem, secondItem) =>
    String(firstItem.name ?? "").localeCompare(String(secondItem.name ?? ""), "pt-BR"),
  );
}

export function sortImages(images: JsonRecord[]): JsonRecord[] {
  return [...images].sort((firstImage, secondImage) => {
    const firstSortOrder = toNumber(firstImage.sortOrder);
    const secondSortOrder = toNumber(secondImage.sortOrder);

    if (firstSortOrder !== secondSortOrder) {
      return firstSortOrder - secondSortOrder;
    }

    return toNumber(firstImage.id) - toNumber(secondImage.id);
  });
}

export function sortPlatformListings(listings: JsonRecord[]): JsonRecord[] {
  return [...listings].sort(
    (firstListing, secondListing) =>
      toNumber(firstListing.price) - toNumber(secondListing.price),
  );
}

export function serializeGame(game: Games) {
  const gameData = game.toJSON() as JsonRecord;

  return {
    ...gameData,
    categories: sortNamedItems(asRecordArray(gameData.categories)),
    tags: sortNamedItems(asRecordArray(gameData.tags)),
    images: sortImages(asRecordArray(gameData.images)),
    platformListings: sortPlatformListings(asRecordArray(gameData.platformListings)),
  };
}

async function findActivePromotionLinks(listingId: number, transaction?: Transaction) {
  const now = new Date();

  return PromotionListing.findAll({
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
    transaction,
  });
}

export async function listActivePromotions(
  listingId: number,
  transaction?: Transaction,
): Promise<JsonRecord[]> {
  const promotionLinks = await findActivePromotionLinks(listingId, transaction);

  return promotionLinks
    .map((link) => link.get("promotion") as Promotion | undefined)
    .filter((promotion): promotion is Promotion => Boolean(promotion))
    .map((promotion) => promotion.toJSON() as JsonRecord);
}

export async function getActiveDiscountPercentage(
  listingId: number,
  transaction?: Transaction,
): Promise<number> {
  return getMaxDiscountPercentage(await listActivePromotions(listingId, transaction));
}

export async function loadReviewStats(gameId: number) {
  const [totalReviews, averageRatingRow] = await Promise.all([
    Review.count({ where: { gameId } }),
    Review.findOne({
      where: { gameId },
      attributes: [[fn("AVG", col("rating")), "averageRating"]],
      raw: true,
    }) as Promise<{ averageRating: string | null } | null>,
  ]);

  const averageRating = toNumber(averageRatingRow?.averageRating);

  return {
    totalReviews,
    averageRating: Number(averageRating.toFixed(1)),
  };
}

export async function enrichPlatformListing(listing: JsonRecord) {
  const listingId = toNumber(listing.id);
  const [stock, activePromotions] = await Promise.all([
    countListingStockSummary(listingId),
    listActivePromotions(listingId),
  ]);

  return {
    ...listing,
    activePromotions,
    pricing: buildPricingFromPromotions(listing.price, activePromotions),
    stock,
  };
}
