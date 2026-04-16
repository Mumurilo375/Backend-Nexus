import { Op, Transaction } from "sequelize";
import sequelize from "../config/database";
import GamePlatformListing from "../models/GamePlatformListing";
import Games from "../models/Games";
import Platform from "../models/Platform";
import Promotion from "../models/Promotion";
import PromotionListing from "../models/PromotionListing";
import { AppError } from "../utils/app-error";
import { deleteManagedMediaList, isManagedMediaUrl, moveUploadedPromotionCover } from "../utils/media-storage";
import { buildPricing, toNumber } from "../utils/money";
import { buildPaginationMeta, getPaginationOffset } from "../utils/pagination";
import { countListingStockSummary } from "../utils/stock";
import { PlainObject, PlainValue } from "../utils/value-types";
import {
  CreatePromotionInput,
  ListPromotionsQuery,
  UpdatePromotionInput,
} from "../validators/promotion.validator";

type JsonRecord = PlainObject;
type UploadedPromotionMedia = {
  coverFile?: Express.Multer.File | null;
};

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

async function serializePromotionListing(
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
    stock: await countListingStockSummary(toNumber(listing.id)),
  };
}

async function serializePromotion(promotion: Promotion, activeOnly = false) {
  const promotionData = promotion.toJSON() as JsonRecord;
  const discountPercentage = toNumber(promotionData.discountPercentage);
  const listings = await Promise.all(
    asRecordArray(promotionData.promotionListings)
      .map((promotionListing) => promotionListing.listing as JsonRecord | undefined)
      .filter((listing): listing is JsonRecord => Boolean(listing))
      .filter((listing) => (activeOnly ? Boolean(listing.isActive) : true))
      .map((listing) => serializePromotionListing(listing, discountPercentage)),
  );

  return {
    id: toNumber(promotionData.id),
    name: String(promotionData.name ?? ""),
    description: promotionData.description ? String(promotionData.description) : null,
    coverImageUrl: promotionData.coverImageUrl ? String(promotionData.coverImageUrl) : null,
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

function getReplacedCoverMediaUrls(currentUrl: string | null | undefined, nextUrl: string | null) {
  if (!currentUrl || currentUrl === nextUrl || !isManagedMediaUrl(currentUrl)) {
    return [];
  }

  return [currentUrl];
}

async function resolvePromotionCoverImageUrl(options: {
  promotionId: number;
  currentCoverImageUrl?: string | null;
  nextCoverImageUrl?: string | null;
  coverFile?: Express.Multer.File | null;
  createdMediaUrls: string[];
}) {
  const {
    promotionId,
    currentCoverImageUrl,
    nextCoverImageUrl,
    coverFile,
    createdMediaUrls,
  } = options;

  if (coverFile) {
    const uploadedCoverImageUrl = await moveUploadedPromotionCover(coverFile, {
      promotionId,
    });
    createdMediaUrls.push(uploadedCoverImageUrl);
    return uploadedCoverImageUrl;
  }

  if (nextCoverImageUrl !== undefined) {
    return nextCoverImageUrl;
  }

  return currentCoverImageUrl ?? null;
}

async function findPromotionOrFail(
  id: number,
  includeListings = false,
  transaction?: Transaction,
): Promise<Promotion> {
  const promotion = await Promotion.findByPk(id, {
    ...(includeListings ? { include: PROMOTION_INCLUDE } : {}),
    transaction,
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
  const serializedItems = await Promise.all(
    rows.map((promotion) => serializePromotion(promotion, false)),
  );
  const items = serializedItems.filter((promotion) =>
    query.activeNow ? promotion.isActive : true,
  );
  const offset = getPaginationOffset(query.page, query.limit);

  return {
    items: items.slice(offset, offset + query.limit),
    meta: buildPaginationMeta(query, items.length),
  };
}

export async function getPromotionById(id: number) {
  return serializePromotion(await findPromotionOrFail(id, true));
}

export async function createPromotion(
  input: CreatePromotionInput,
  uploadedPromotionMedia: UploadedPromotionMedia = {},
) {
  const createdMediaUrls: string[] = [];

  try {
    const promotionId = await sequelize.transaction(async (transaction) => {
      const promotion = await Promotion.create(
        {
          ...input,
          coverImageUrl: input.coverImageUrl ?? null,
        },
        { transaction },
      );

      const coverImageUrl = await resolvePromotionCoverImageUrl({
        promotionId: promotion.id,
        currentCoverImageUrl: null,
        nextCoverImageUrl: input.coverImageUrl ?? null,
        coverFile: uploadedPromotionMedia.coverFile,
        createdMediaUrls,
      });

      if (coverImageUrl !== promotion.coverImageUrl) {
        await promotion.update({ coverImageUrl }, { transaction });
      }

      return promotion.id;
    });

    return getPromotionById(promotionId);
  } catch (error) {
    await deleteManagedMediaList(createdMediaUrls);
    throw error;
  }
}

export async function updatePromotion(
  id: number,
  input: UpdatePromotionInput,
  uploadedPromotionMedia: UploadedPromotionMedia = {},
) {
  const createdMediaUrls: string[] = [];

  try {
    const mediaUrlsToDelete = await sequelize.transaction(async (transaction) => {
      const promotion = await findPromotionOrFail(id, false, transaction);
      const currentCoverImageUrl = promotion.coverImageUrl;
      const nextCoverImageUrl = await resolvePromotionCoverImageUrl({
        promotionId: promotion.id,
        currentCoverImageUrl,
        nextCoverImageUrl: input.coverImageUrl,
        coverFile: uploadedPromotionMedia.coverFile,
        createdMediaUrls,
      });

      await promotion.update(
        {
          ...input,
          coverImageUrl: nextCoverImageUrl,
        },
        { transaction },
      );

      return getReplacedCoverMediaUrls(currentCoverImageUrl, nextCoverImageUrl);
    });

    await deleteManagedMediaList(mediaUrlsToDelete);
    return getPromotionById(id);
  } catch (error) {
    await deleteManagedMediaList(createdMediaUrls);
    throw error;
  }
}

export async function deletePromotion(id: number) {
  const mediaUrlsToDelete = await sequelize.transaction(async (transaction) => {
    await PromotionListing.destroy({ where: { promotionId: id }, transaction });

    const promotion = await findPromotionOrFail(id, false, transaction);
    const coverImageUrl = promotion.coverImageUrl;
    await promotion.destroy({ transaction });

    return coverImageUrl && isManagedMediaUrl(coverImageUrl) ? [coverImageUrl] : [];
  });

  await deleteManagedMediaList(mediaUrlsToDelete);
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
