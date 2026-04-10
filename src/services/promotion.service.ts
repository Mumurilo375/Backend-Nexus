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

function buildPromotionInclude(requiredListing = false) {
  return [
    {
      model: PromotionListing,
      as: "promotionListings",
      required: requiredListing,
      include: [
        {
          model: GamePlatformListing,
          as: "listing",
          required: requiredListing,
          where: requiredListing ? { isActive: true } : undefined,
          include: [
            { model: Games, as: "game" },
            { model: Platform, as: "platform" },
          ],
        },
      ],
    },
  ];
}

function normalizePromotion(promotion: Promotion) {
  const promotionData = promotion.toJSON() as Record<string, unknown>;
  const promotionListings = Array.isArray(promotionData.promotionListings)
    ? (promotionData.promotionListings as Array<Record<string, unknown>>)
    : [];
  const listingLink =
    promotionListings.find((promotionListing) => promotionListing.listing) ?? null;
  const listing = (listingLink?.listing as Record<string, unknown> | undefined) ?? null;
  const basePrice = toMoneyNumber(listing?.price);
  const discountPercentage = toMoneyNumber(promotionData.discountPercentage);
  const discountAmount = roundMoney((basePrice * discountPercentage) / 100);
  const finalPrice = roundMoney(basePrice - discountAmount);

  return {
    id: Number(promotionData.id),
    name: String(promotionData.name ?? ""),
    description: promotionData.description ? String(promotionData.description) : null,
    discountPercentage,
    startDate: promotionData.startDate,
    endDate: promotionData.endDate,
    isActive: Boolean(promotionData.isActive),
    createdAt: promotionData.createdAt,
    listingId: listing ? Number(listing.id) : null,
    listing: listing
      ? {
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
        }
      : null,
  };
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

  const result = await Promotion.findAndCountAll({
    where: query.activeNow
      ? {
          isActive: true,
          startDate: { [Op.lte]: now },
          endDate: { [Op.gte]: now },
        }
      : undefined,
    limit: query.limit,
    offset,
    order: [["id", "DESC"]],
    distinct: true,
    include: buildPromotionInclude(Boolean(query.activeNow)),
  });

  return {
    items: result.rows
      .map(normalizePromotion)
      .filter((promotion) => (query.activeNow ? Boolean(promotion.listing) : true)),
    meta: buildPaginationMeta(query, result.count),
  };
}

export async function getPromotionById(id: number) {
  const promotion = await Promotion.findByPk(id, {
    include: buildPromotionInclude(),
  });

  if (!promotion) {
    throw new AppError(404, "PROMOTION_NOT_FOUND", "Promotion not found");
  }

  return normalizePromotion(promotion);
}

export async function createPromotion(input: CreatePromotionInput) {
  return Promotion.create({ ...input });
}

export async function updatePromotion(id: number, input: UpdatePromotionInput) {
  const promotion = await findPromotionOrFail(id);
  await promotion.update(input);
  return promotion;
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
