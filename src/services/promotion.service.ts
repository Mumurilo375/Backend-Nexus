import { Op } from "sequelize";
import GamePlatformListing from "../models/GamePlatformListing";
import Games from "../models/Games";
import Platform from "../models/Platform";
import Promotion from "../models/Promotion";
import PromotionListing from "../models/PromotionListing";
import { AppError } from "../utils/app-error";
import { buildPricing, toNumber } from "../utils/money";
import { buildPaginationMeta, getPaginationOffset } from "../utils/pagination";
import { PlainObject, PlainValue } from "../utils/value-types";
import {
  CreatePromotionInput,
  ListPromotionsQuery,
  UpdatePromotionInput,
} from "../validators/promotion.validator";

type JsonRecord = PlainObject;

const PROMOTION_INCLUDE = [
  {
    model: PromotionListing,
    as: "promotionListings",
    include: [
      {
        model: GamePlatformListing,
        as: "listing",
        include: [
          { model: Games, as: "game" },
          { model: Platform, as: "platform" },
        ],
      },
    ],
  },
];

function asRecordArray(value: PlainValue): JsonRecord[] {
  return Array.isArray(value) ? (value as JsonRecord[]) : [];
}

function serializePromotionListing(
  listing: JsonRecord,
  discountPercentage: number,
) {
  const game = listing.game as JsonRecord | undefined;
  const platform = listing.platform as JsonRecord | undefined;

  return {
    id: toNumber(listing.id),
    price: toNumber(listing.price),
    isActive: Boolean(listing.isActive),
    game: game
      ? {
          id: toNumber(game.id),
          title: String(game.title ?? ""),
          coverImageUrl: game.coverImageUrl,
        }
      : null,
    platform: platform
      ? {
          id: toNumber(platform.id),
          name: String(platform.name ?? ""),
          slug: String(platform.slug ?? ""),
        }
      : null,
    pricing: buildPricing(listing.price, discountPercentage),
  };
}

function serializePromotion(promotion: Promotion, activeOnly = false) {
  const promotionData = promotion.toJSON() as JsonRecord;
  const discountPercentage = toNumber(promotionData.discountPercentage);
  const listings = asRecordArray(promotionData.promotionListings)
    .map((promotionListing) => promotionListing.listing as JsonRecord | undefined)
    .filter((listing): listing is JsonRecord => Boolean(listing))
    .filter((listing) => (activeOnly ? Boolean(listing.isActive) : true))
    .map((listing) => serializePromotionListing(listing, discountPercentage));

  return {
    id: toNumber(promotionData.id),
    name: String(promotionData.name ?? ""),
    description: promotionData.description ? String(promotionData.description) : null,
    discountPercentage,
    startDate: promotionData.startDate,
    endDate: promotionData.endDate,
    isActive: Boolean(promotionData.isActive),
    createdAt: promotionData.createdAt,
    updatedAt: promotionData.updatedAt,
    listingIds: listings.map((listing) => listing.id),
    listings,
  };
}

async function findPromotionOrFail(id: number, includeListings = false): Promise<Promotion> {
  const promotion = await Promotion.findByPk(id, {
    ...(includeListings ? { include: PROMOTION_INCLUDE } : {}),
  });

  if (!promotion) {
    throw new AppError(404, "PROMOTION_NOT_FOUND", "Promotion not found");
  }

  return promotion;
}

async function findListingOrFail(listingId: number) {
  const listing = await GamePlatformListing.findByPk(listingId);

  if (!listing) {
    throw new AppError(404, "LISTING_NOT_FOUND", "Listing not found");
  }
}

export async function listPromotions(query: ListPromotionsQuery) {
  const now = new Date();
  const rows = await Promotion.findAll({
    where: query.activeNow
      ? {
          isActive: true,
          startDate: { [Op.lte]: now },
          endDate: { [Op.gte]: now },
        }
      : undefined,
    order: [["id", "DESC"]],
    include: PROMOTION_INCLUDE,
  });
  const items = rows
    .map((promotion) => serializePromotion(promotion, Boolean(query.activeNow)))
    .filter((promotion) => (query.activeNow ? promotion.listings.length > 0 : true));
  const offset = getPaginationOffset(query.page, query.limit);

  return {
    items: items.slice(offset, offset + query.limit),
    meta: buildPaginationMeta(query, items.length),
  };
}

export async function getPromotionById(id: number) {
  return serializePromotion(await findPromotionOrFail(id, true));
}

export async function createPromotion(input: CreatePromotionInput) {
  const promotion = await Promotion.create({ ...input });
  return getPromotionById(promotion.id);
}

export async function updatePromotion(id: number, input: UpdatePromotionInput) {
  const promotion = await findPromotionOrFail(id);
  await promotion.update(input);
  return getPromotionById(id);
}

export async function deletePromotion(id: number) {
  const promotion = await findPromotionOrFail(id);
  await promotion.destroy();
}

export async function linkListingToPromotion(promotionId: number, listingId: number) {
  await Promise.all([
    findPromotionOrFail(promotionId),
    findListingOrFail(listingId),
  ]);

  const [link] = await PromotionListing.findOrCreate({
    where: { promotionId, listingId },
    defaults: { promotionId, listingId },
  });

  return link;
}

export async function unlinkListingFromPromotion(promotionId: number, listingId: number) {
  await PromotionListing.destroy({ where: { promotionId, listingId } });
}
