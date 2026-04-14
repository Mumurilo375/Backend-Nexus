import Order from "../models/Order";
import { AppError } from "../utils/app-error";
import { buildPaginationMeta, getPaginationOffset } from "../utils/pagination";
import { ORDER_WITH_ITEMS_INCLUDE } from "./order.shared";
import { ListOrdersQuery } from "../validators/order.validator";

export async function listUserOrders(userId: number, query: ListOrdersQuery) {
  const result = await Order.findAndCountAll({
    where: { userId },
    limit: query.limit,
    offset: getPaginationOffset(query.page, query.limit),
    order: [["id", "DESC"]],
    include: ORDER_WITH_ITEMS_INCLUDE,
  });

  return {
    items: result.rows,
    meta: buildPaginationMeta(query, result.count),
  };
}

export async function getUserOrderById(userId: number, orderId: number) {
  const order = await Order.findOne({
    where: { id: orderId, userId },
    include: ORDER_WITH_ITEMS_INCLUDE,
  });

  if (!order) {
    throw new AppError(404, "ORDER_NOT_FOUND", "Order not found");
  }

  return order;
}
