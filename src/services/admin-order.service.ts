import { Op } from "sequelize";
import Order from "../models/Order";
import { AppError } from "../utils/app-error";
import { buildPaginationMeta, getPaginationOffset } from "../utils/pagination";
import {
  ADMIN_ORDER_DETAILS_INCLUDE,
  ADMIN_ORDER_LIST_INCLUDE,
  serializeAdminOrderDetails,
  serializeAdminOrderSummary,
} from "./order.shared";
import { ListAdminOrdersQuery } from "../validators/admin-order.validator";

function buildOrderFilters(query: ListAdminOrdersQuery) {
  return {
    ...(query.status ? { status: query.status } : {}),
    ...(query.paymentStatus ? { paymentStatus: query.paymentStatus } : {}),
    ...(query.q
      ? {
          [Op.or]: [
            { orderNumber: { [Op.iLike]: `%${query.q}%` } },
            { "$user.email$": { [Op.iLike]: `%${query.q}%` } },
            { "$user.username$": { [Op.iLike]: `%${query.q}%` } },
          ],
        }
      : {}),
  };
}

export async function listAdminOrders(query: ListAdminOrdersQuery) {
  const result = await Order.findAndCountAll({
    where: buildOrderFilters(query),
    limit: query.limit,
    offset: getPaginationOffset(query.page, query.limit),
    order: [["createdAt", "DESC"], ["id", "DESC"]],
    include: ADMIN_ORDER_LIST_INCLUDE,
  });

  return {
    items: result.rows.map(serializeAdminOrderSummary),
    meta: buildPaginationMeta(query, result.count),
  };
}

export async function getAdminOrderById(orderId: number) {
  const order = await Order.findByPk(orderId, {
    include: ADMIN_ORDER_DETAILS_INCLUDE,
  });

  if (!order) {
    throw new AppError(404, "ORDER_NOT_FOUND", "Order not found");
  }

  return serializeAdminOrderDetails(order);
}
