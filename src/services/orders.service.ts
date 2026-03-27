import Order from "../models/Order";
import OrderItem from "../models/OrderItem";
import GamePlatformListing from "../models/GamePlatformListing";
import Games from "../models/Games";
import Platform from "../models/Platform";
import GameKey from "../models/GameKey";
import DeliveredKey from "../models/DeliveredKey";
import sequelize from "../config/database";
import { AppError } from "../utils/app-error";
import { ListOrdersQuery } from "../validators/order.validator";
import { Transaction } from "sequelize";

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

async function getUserOrderByIdForUpdate(userId: number, orderId: number, transaction: Transaction) {
  const order = await Order.findOne({
    where: { id: orderId, userId },
    include: ORDER_ITEMS_INCLUDE,
    transaction,
  });

  if (!order) {
    throw new AppError(404, "ORDER_NOT_FOUND", "Order not found");
  }

  return order;
}

async function applyPaidTransition(order: Order, userId: number, transaction: Transaction) {
  const orderStatus = String(order.get("status"));
  if (orderStatus === "paid") return order;

  const items = (order.get("items") as Array<OrderItem & { gameKey?: GameKey }> | undefined) ?? [];

  if (items.length === 0) {
    throw new AppError(409, "ORDER_EMPTY", "Order has no items");
  }

  const now = new Date();

  for (const item of items) {
    const orderItemId = Number(item.get("id"));
    const gameKeyId = Number(item.get("gameKeyId"));

    if (!gameKeyId) {
      throw new AppError(409, "ORDER_ITEM_WITHOUT_KEY", "Order item has no reserved key");
    }

    const gameKey = await GameKey.findByPk(gameKeyId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!gameKey) {
      throw new AppError(409, "GAME_KEY_NOT_FOUND", "Reserved key not found");
    }

    await gameKey.update(
      {
        status: "sold",
        soldAt: now,
      },
      { transaction }
    );

    const deliveredKey = await DeliveredKey.findOne({
      where: { orderItemId },
      transaction,
    });

    if (!deliveredKey) {
      await DeliveredKey.create(
        {
          userId,
          orderItemId,
          gameKeyId,
          deliveredAt: now,
        },
        { transaction }
      );
    }
  }

  await order.update(
    {
      status: "paid",
      paymentStatus: "succeeded",
      paymentConfirmedAt: now,
      cancelledAt: null,
    },
    { transaction }
  );

  return order;
}

export async function confirmUserOrderPayment(userId: number, orderId: number) {
  const baseOrder = await getUserOrderById(userId, orderId);
  const orderStatus = String(baseOrder.get("status"));

  if (orderStatus === "cancelled") {
    throw new AppError(409, "ORDER_CANCELLED", "Cancelled order cannot be confirmed");
  }

  if (orderStatus === "paid") {
    return baseOrder;
  }

  return sequelize.transaction(async (transaction) => {
    const order = await getUserOrderByIdForUpdate(userId, orderId, transaction);
    await applyPaidTransition(order, userId, transaction);
    return getUserOrderByIdForUpdate(userId, orderId, transaction);
  });
}

export async function cancelUserPendingOrder(userId: number, orderId: number) {
  return sequelize.transaction(async (transaction) => {
    const order = await getUserOrderByIdForUpdate(userId, orderId, transaction);
    const orderStatus = String(order.get("status"));

    if (orderStatus === "paid") {
      throw new AppError(409, "ORDER_ALREADY_PAID", "Paid order cannot be cancelled");
    }

    if (orderStatus === "cancelled") {
      return getUserOrderByIdForUpdate(userId, orderId, transaction);
    }

    const items = (order.get("items") as Array<OrderItem & { gameKey?: GameKey }> | undefined) ?? [];

    for (const item of items) {
      const gameKeyId = Number(item.get("gameKeyId"));
      if (!gameKeyId) continue;

      const gameKey = await GameKey.findByPk(gameKeyId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!gameKey) continue;

      await gameKey.update(
        {
          status: "available",
          reservedAt: null,
          soldAt: null,
        },
        { transaction }
      );
    }

    await order.update(
      {
        status: "cancelled",
        paymentStatus: "cancelled",
        cancelledAt: new Date(),
      },
      { transaction }
    );

    return getUserOrderByIdForUpdate(userId, orderId, transaction);
  });
}
