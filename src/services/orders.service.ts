import Order from "../models/Order";
import OrderItem from "../models/OrderItem";
import GamePlatformListing from "../models/GamePlatformListing";
import Games from "../models/Games";
import Platform from "../models/Platform";
import GameKey from "../models/GameKey";
import { AppError } from "../utils/app-error";
import { ListOrdersQuery } from "../validators/order.validator";

const ORDER_ITEMS_INCLUDE = [
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
      { model: GameKey, as: "gameKey" },
    ],
  },
];

export async function listUserOrders(userId: number, query: ListOrdersQuery) {
  const offset = (query.page - 1) * query.limit;

  const result = await Order.findAndCountAll({
    where: { userId },
    limit: query.limit,
    offset,
    order: [["id", "DESC"]],
    include: ORDER_ITEMS_INCLUDE,
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

export async function getUserOrderById(userId: number, orderId: number) {
  const order = await Order.findOne({
    where: { id: orderId, userId },
    include: ORDER_ITEMS_INCLUDE,
  });

  if (!order) {
    throw new AppError(404, "ORDER_NOT_FOUND", "Order not found");
  }

  return order;
}
