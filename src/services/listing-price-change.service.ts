import { Op, Transaction } from "sequelize";
import Games from "../models/Games";
import GamePlatformListing from "../models/GamePlatformListing";
import ListingPriceChange from "../models/ListingPriceChange";
import Platform from "../models/Platform";
import Users from "../models/Users";
import { ListListingPriceChangesQuery } from "../validators/listing-price-change.validator";

function toMoneyNumber(value: unknown) {
  return Number(value) || 0;
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
  const offset = (query.page - 1) * query.limit;
  const filters: { [key: string]: unknown; [Op.or]?: unknown } = {};

  if (query.listingId) {
    filters.listingId = query.listingId;
  }

  if (query.q) {
    filters[Op.or] = [
      { "$listing.game.title$": { [Op.iLike]: `%${query.q}%` } },
      { "$listing.platform.name$": { [Op.iLike]: `%${query.q}%` } },
      { "$changedBy.username$": { [Op.iLike]: `%${query.q}%` } },
      { "$changedBy.email$": { [Op.iLike]: `%${query.q}%` } },
    ];
  }

  const result = await ListingPriceChange.findAndCountAll({
    where: filters,
    limit: query.limit,
    offset,
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
    items: result.rows.map((priceChange) => {
      const listing = priceChange.get("listing") as GamePlatformListing | undefined;
      const changedBy = priceChange.get("changedBy") as Users | undefined;
      const game = listing?.get("game") as Games | undefined;
      const platform = listing?.get("platform") as Platform | undefined;

      return {
        id: priceChange.id,
        listingId: priceChange.listingId,
        previousPrice:
          priceChange.previousPrice === null ? null : toMoneyNumber(priceChange.previousPrice),
        nextPrice: toMoneyNumber(priceChange.nextPrice),
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
    }),
    meta: {
      page: query.page,
      limit: query.limit,
      total: result.count,
      totalPages: Math.ceil(result.count / query.limit),
    },
  };
}
