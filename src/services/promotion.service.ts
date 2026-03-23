import Promotion from "../models/Promotion";
import PromotionListing from "../models/PromotionListing";
import GamePlatformListing from "../models/GamePlatformListing";
import Games from "../models/Games";
import Platform from "../models/Platform";
import { AppError } from "../utils/app-error";
import { buildPaginationMeta, getPaginationOffset } from "../utils/pagination";
import { CreatePromotionInput, ListPromotionsQuery, UpdatePromotionInput } from "../validators/promotion.validator";

const PROMOTION_INCLUDE = [
  {
    model: GamePlatformListing,
    as: "listings",
    include: [
      { model: Games, as: "game" },
      { model: Platform, as: "platform" },
    ],
  },
];

async function findPromotionOrFail(id: number): Promise<Promotion> {
  const promotion = await Promotion.findByPk(id);
  if (!promotion) {
    throw new AppError(404, "PROMOTION_NOT_FOUND", "Promotion not found");
  }
  return promotion;
}

export async function listPromotions(query: ListPromotionsQuery) {
  const offset = getPaginationOffset(query.page, query.limit);

  const result = await Promotion.findAndCountAll({
    limit: query.limit,
    offset,
    order: [["id", "DESC"]],
    include: PROMOTION_INCLUDE,
  });

  return {
    items: result.rows,
    meta: buildPaginationMeta(query, result.count),
  };
}

export async function getPromotionById(id: number) {
  const promotion = await Promotion.findByPk(id, {
    include: PROMOTION_INCLUDE,
  });

  if (!promotion) {
    throw new AppError(404, "PROMOTION_NOT_FOUND", "Promotion not found");
  }

  return promotion;
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
