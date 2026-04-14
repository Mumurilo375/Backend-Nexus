import Order from "../models/Order";
import OrderItem from "../models/OrderItem";
import { buildPaginationMeta, getPaginationOffset } from "../utils/pagination";
import { LISTING_WITH_GAME_AND_PLATFORM_INCLUDE } from "./order.shared";
import { ListOrdersQuery } from "../validators/order.validator";

export async function listUserPurchaseHistory(userId: number, query: ListOrdersQuery) {
  const result = await Order.findAndCountAll({
    where: { userId },
    limit: query.limit,
    offset: getPaginationOffset(query.page, query.limit),
    order: [["id", "DESC"]],
    include: [
      {
        model: OrderItem,
        as: "items",
        include: [LISTING_WITH_GAME_AND_PLATFORM_INCLUDE],
      },
    ],
  });

  return {
    items: result.rows,
    meta: buildPaginationMeta(query, result.count),
  };
}
