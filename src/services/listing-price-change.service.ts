import { Op, Transaction } from "sequelize";
import GamePlatformListing from "../models/GamePlatformListing";
import Games from "../models/Games";
import ListingPriceChange from "../models/ListingPriceChange";
import Platform from "../models/Platform";
import Users from "../models/Users";
import { toNumber } from "../utils/money";
import { buildPaginationMeta, getPaginationOffset } from "../utils/pagination";
import { ListListingPriceChangesQuery } from "../validators/listing-price-change.validator";

function buildFilters(query: ListListingPriceChangesQuery) {
  return {
    ...(query.listingId ? { listingId: query.listingId } : {}),
    ...(query.q
      ? {
          [Op.or]: [
            { "$listing.game.title$": { [Op.iLike]: `%${query.q}%` } },
            { "$listing.platform.name$": { [Op.iLike]: `%${query.q}%` } },
            { "$changedBy.username$": { [Op.iLike]: `%${query.q}%` } },
            { "$changedBy.email$": { [Op.iLike]: `%${query.q}%` } },
          ],
        }
      : {}),
  };
}

function serializeListingPriceChange(priceChange: ListingPriceChange) {
  const listing = priceChange.get("listing") as GamePlatformListing | undefined;
  const changedBy = priceChange.get("changedBy") as Users | undefined;
  const game = listing?.get("game") as Games | undefined;
  const platform = listing?.get("platform") as Platform | undefined;

  return {
    id: priceChange.id,
    listingId: priceChange.listingId,
    previousPrice:
      priceChange.previousPrice === null ? null : toNumber(priceChange.previousPrice),
    nextPrice: toNumber(priceChange.nextPrice),
    createdAt: priceChange.createdAt,
    game: game
      ? {
          id: game.id,
          title: game.title,
        }
      : null,
    platform: platform
      ? {
          id: platform.id,
          name: platform.name,
          slug: platform.slug,
        }
      : null,
    changedBy: changedBy
      ? {
          id: changedBy.id,
          username: changedBy.username,
          email: changedBy.email,
        }
      : null,
  };
}

export async function createListingPriceChange(params: {
  listingId: number;
  previousPrice: number | null;
  nextPrice: number;
  changedByUserId?: number | null;
  transaction?: Transaction;
}) {
  const { listingId, previousPrice, nextPrice, changedByUserId, transaction } = params;

  return ListingPriceChange.create(
    {
      listingId,
      previousPrice,
      nextPrice,
      changedByUserId: changedByUserId ?? null,
    },
    { transaction },
  );
}

export async function listListingPriceChanges(query: ListListingPriceChangesQuery) {
  const result = await ListingPriceChange.findAndCountAll({
    where: buildFilters(query),
    limit: query.limit,
    offset: getPaginationOffset(query.page, query.limit),
    order: [["createdAt", "DESC"], ["id", "DESC"]],
    distinct: true,
    include: [
      {
        model: GamePlatformListing,
        as: "listing",
        required: true,
        include: [
          { model: Games, as: "game", attributes: ["id", "title"] },
          { model: Platform, as: "platform", attributes: ["id", "name", "slug"] },
        ],
      },
      {
        model: Users,
        as: "changedBy",
        attributes: ["id", "username", "email"],
        required: false,
      },
    ],
  });

  return {
    items: result.rows.map(serializeListingPriceChange),
    meta: buildPaginationMeta(query, result.count),
  };
}
