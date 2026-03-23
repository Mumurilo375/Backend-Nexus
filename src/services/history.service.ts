import Order from "../models/Order";
import OrderItem from "../models/OrderItem";
import GamePlatformListing from "../models/GamePlatformListing";
import Games from "../models/Games";
import Platform from "../models/Platform";
import { ListOrdersQuery } from "../validators/order.validator";

export async function listUserPurchaseHistory(userId: number, query: ListOrdersQuery) {
  const offset = (query.page - 1) * query.limit;

  const result = await Order.findAndCountAll({
    where: { userId },
    limit: query.limit,
    offset,
    order: [["id", "DESC"]],
    include: [
      {
        model: OrderItem,
        as: "items",
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
