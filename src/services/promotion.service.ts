import GamePlatformListing from "../models/GamePlatformListing";
import Games from "../models/Games";
import Platform from "../models/Platform";
import Promotion from "../models/Promotion";
import PromotionListing from "../models/PromotionListing";
import { Op } from "sequelize";
import { AppError } from "../utils/app-error";
import { buildPaginationMeta, getPaginationOffset } from "../utils/pagination";
import { CreatePromotionInput, ListPromotionsQuery, UpdatePromotionInput } from "../validators/promotion.validator";

function toMoneyNumber(value: unknown) {
  return Number(value) || 0;
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function buildPromotionInclude() {
  return [
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
}

function normalizePromotionListing(
  listing: Record<string, unknown>,
  discountPercentage: number,
) {
  const basePrice = toMoneyNumber(listing.price);
  const discountAmount = roundMoney((basePrice * discountPercentage) / 100);
  const finalPrice = roundMoney(basePrice - discountAmount);

  return {
    id: Number(listing.id),
    price: basePrice,
    isActive: Boolean(listing.isActive),
    game: listing.game
      ? {
          id: Number((listing.game as Record<string, unknown>).id ?? 0),
          title: String((listing.game as Record<string, unknown>).title ?? ""),
          coverImageUrl: (listing.game as Record<string, unknown>).coverImageUrl,
        }
      : null,
    platform: listing.platform
      ? {
          id: Number((listing.platform as Record<string, unknown>).id ?? 0),
          name: String((listing.platform as Record<string, unknown>).name ?? ""),
          slug: String((listing.platform as Record<string, unknown>).slug ?? ""),
        }
      : null,
    pricing: {
      basePrice,
      discountPercentage,
      discountAmount,
      finalPrice,
      hasDiscount: discountPercentage > 0,
    },
  };
}

function normalizePromotion(promotion: Promotion, activeOnly = false) {
  const promotionData = promotion.toJSON() as Record<string, unknown>;
  const discountPercentage = toMoneyNumber(promotionData.discountPercentage);
  const promotionListings = Array.isArray(promotionData.promotionListings)
    ? (promotionData.promotionListings as Array<Record<string, unknown>>)
    : [];
  const listings = promotionListings
    .map((promotionListing) => promotionListing.listing as Record<string, unknown> | undefined)
    .filter((listing): listing is Record<string, unknown> => Boolean(listing))
    .filter((listing) => (activeOnly ? Boolean(listing.isActive) : true))
    .map((listing) => normalizePromotionListing(listing, discountPercentage));

  return {
    id: Number(promotionData.id),
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

async function findPromotionWithListingsOrFail(id: number): Promise<Promotion> {
  const promotion = await Promotion.findByPk(id, {
    include: buildPromotionInclude(),
  });

  if (!promotion) {
    throw new AppError(404, "PROMOTION_NOT_FOUND", "Promotion not found");
  }

  return promotion;
}

async function findPromotionOrFail(id: number): Promise<Promotion> {
  const promotion = await Promotion.findByPk(id);
  if (!promotion) {
    throw new AppError(404, "PROMOTION_NOT_FOUND", "Promotion not found");
  }
  return promotion;
}

export async function listPromotions(query: ListPromotionsQuery) {
  const offset = getPaginationOffset(query.page, query.limit);
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
    include: buildPromotionInclude(),
  });
  const items = rows
    .map((promotion) => normalizePromotion(promotion, Boolean(query.activeNow)))
    .filter((promotion) => (query.activeNow ? promotion.listings.length > 0 : true));

  return {
    items: items.slice(offset, offset + query.limit),
    meta: buildPaginationMeta(query, items.length),
  };
}

export async function getPromotionById(id: number) {
  const promotion = await findPromotionWithListingsOrFail(id);
  return normalizePromotion(promotion);
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
  await findPromotionOrFail(promotionId);

  const listing = await GamePlatformListing.findByPk(listingId);
  if (!listing) {
    throw new AppError(404, "LISTING_NOT_FOUND", "Listing not found");
  }

  const [link] = await PromotionListing.findOrCreate({
    where: { promotionId, listingId },
    defaults: { promotionId, listingId },
  });

  return link;
}

export async function unlinkListingFromPromotion(promotionId: number, listingId: number) {
  await PromotionListing.destroy({ where: { promotionId, listingId } });
}
