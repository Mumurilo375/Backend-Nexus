import Order from "../models/Order";
import OrderItem from "../models/OrderItem";
import { AppError } from "../utils/app-error";
import { buildPaginationMeta, getPaginationOffset } from "../utils/pagination";
import {
  GAME_KEY_INCLUDE,
  LISTING_WITH_GAME_AND_PLATFORM_INCLUDE,
} from "./order.shared";
import { ListOrderItemsQuery } from "../validators/order-item.validator";

function buildUserOrderItemInclude(userId: number) {
  return [
    {
      model: Order,
      as: "order",
      where: { userId },
      required: true,
    },
    LISTING_WITH_GAME_AND_PLATFORM_INCLUDE,
    GAME_KEY_INCLUDE,
  ];
}

export async function listUserOrderItems(userId: number, query: ListOrderItemsQuery) {
  const result = await OrderItem.findAndCountAll({
    limit: query.limit,
    offset: getPaginationOffset(query.page, query.limit),
    order: [["id", "DESC"]],
    include: buildUserOrderItemInclude(userId),
  });

  return {
    items: result.rows,
    meta: buildPaginationMeta(query, result.count),
  };
}

export async function getUserOrderItemById(userId: number, orderItemId: number) {
  const item = await OrderItem.findOne({
    where: { id: orderItemId },
    include: buildUserOrderItemInclude(userId),
  });

  if (!item) {
    throw new AppError(404, "ORDER_ITEM_NOT_FOUND", "Order item not found");
  }

  return item;
}
