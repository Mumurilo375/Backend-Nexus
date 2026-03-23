import DeliveredKey from "../models/DeliveredKey";
import GameKey from "../models/GameKey";
import OrderItem from "../models/OrderItem";
import GamePlatformListing from "../models/GamePlatformListing";
import Games from "../models/Games";
import Platform from "../models/Platform";
import { AppError } from "../utils/app-error";
import { buildPaginationMeta, getPaginationOffset } from "../utils/pagination";
import { ListDeliveredKeysQuery } from "../validators/delivered-key.validator";

const DELIVERED_KEY_INCLUDE = [
  { model: GameKey, as: "gameKey" },
  {
    model: OrderItem,
    as: "orderItem",
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

export async function listUserDeliveredKeys(userId: number, query: ListDeliveredKeysQuery) {
  const offset = getPaginationOffset(query.page, query.limit);

  const result = await DeliveredKey.findAndCountAll({
    where: { userId },
    limit: query.limit,
    offset,
    order: [["id", "DESC"]],
    include: DELIVERED_KEY_INCLUDE,
  });

  return {
    items: result.rows,
    meta: buildPaginationMeta(query, result.count),
  };
}

export async function getUserDeliveredKeyById(userId: number, deliveredKeyId: number) {
  const item = await DeliveredKey.findOne({
    where: { id: deliveredKeyId, userId },
    include: DELIVERED_KEY_INCLUDE,
  });

  if (!item) {
    throw new AppError(404, "DELIVERED_KEY_NOT_FOUND", "Delivered key not found");
  }

  return item;
}
