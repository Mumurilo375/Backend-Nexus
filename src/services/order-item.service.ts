import Order from "../models/Order";
import OrderItem from "../models/OrderItem";
import GamePlatformListing from "../models/GamePlatformListing";
import Games from "../models/Games";
import Platform from "../models/Platform";
import GameKey from "../models/GameKey";
import { AppError } from "../utils/app-error";
import { ListOrderItemsQuery } from "../validators/order-item.validator";

export async function listUserOrderItems(userId: number, query: ListOrderItemsQuery) {
  const offset = (query.page - 1) * query.limit;

  const result = await OrderItem.findAndCountAll({
    limit: query.limit,
    offset,
    order: [["id", "DESC"]],
    include: [
      {
        model: Order,
        as: "order",
        where: { userId },
        required: true,
      },
      {
        model: GamePlatformListing,
        as: "listing",
        include: [
          { model: Games, as: "game" },
          { model: Platform, as: "platform" },
        ],
      },
      { model: GameKey, as: "gameKey" },
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

export async function getUserOrderItemById(userId: number, orderItemId: number) {
  const item = await OrderItem.findOne({
    where: { id: orderItemId },
    include: [
      {
        model: Order,
        as: "order",
        where: { userId },
        required: true,
      },
      {
        model: GamePlatformListing,
        as: "listing",
        include: [
          { model: Games, as: "game" },
          { model: Platform, as: "platform" },
        ],
      },
      { model: GameKey, as: "gameKey" },
    ],
  });

  if (!item) {
    throw new AppError(404, "ORDER_ITEM_NOT_FOUND", "Order item not found");
  }

  return item;
}
