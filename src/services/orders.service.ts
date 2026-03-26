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
import { getStripeClient } from "./payment-gateway.service";

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

async function getOrderByIdForUpdate(orderId: number, transaction: Transaction) {
  const order = await Order.findOne({
    where: { id: orderId },
    include: ORDER_ITEMS_INCLUDE,
    transaction,
  });

  if (!order) {
    throw new AppError(404, "ORDER_NOT_FOUND", "Order not found");
  }

  return order;
}

async function applyPaidTransition(
  order: Order,
  userId: number,
  transaction: Transaction,
  providerPaymentIntentId?: string | null
) {
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
      providerPaymentIntentId: providerPaymentIntentId ?? order.get("providerPaymentIntentId"),
      paymentConfirmedAt: now,
      paymentErrorCode: null,
      paymentErrorMessage: null,
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

  const provider = String(baseOrder.get("paymentProvider") ?? "");
  const checkoutSessionId = String(baseOrder.get("providerCheckoutSessionId") ?? "");

  if (provider !== "stripe" || !checkoutSessionId) {
    throw new AppError(409, "PAYMENT_PROVIDER_NOT_FOUND", "Payment provider data not found for order");
  }

  const stripe = getStripeClient();
  const checkoutSession = await stripe.checkout.sessions.retrieve(checkoutSessionId, {
    expand: ["payment_intent", "payment_intent.latest_charge"],
  });

  if (checkoutSession.payment_status !== "paid") {
    throw new AppError(409, "PAYMENT_NOT_CONFIRMED", "Payment is still pending at the provider");
  }

  const paymentIntentId =
    typeof checkoutSession.payment_intent === "string"
      ? checkoutSession.payment_intent
      : checkoutSession.payment_intent?.id;

  const charge =
    typeof checkoutSession.payment_intent === "string"
      ? undefined
      : checkoutSession.payment_intent?.latest_charge;

  const paymentMethodDetails =
    charge && typeof charge !== "string" ? charge.payment_method_details?.card : null;

  return sequelize.transaction(async (transaction) => {
    const order = await getUserOrderByIdForUpdate(userId, orderId, transaction);
    await applyPaidTransition(order, userId, transaction, paymentIntentId ?? null);
    await order.update(
      {
        cardBrand: paymentMethodDetails?.brand ?? null,
        cardLast4: paymentMethodDetails?.last4 ?? null,
      },
      { transaction }
    );
    return getUserOrderByIdForUpdate(userId, orderId, transaction);
  });
}

export async function markOrderPaymentFailedByCheckoutSessionId(
  checkoutSessionId: string,
  errorCode?: string,
  errorMessage?: string
) {
  await Order.update(
    {
      paymentStatus: "failed",
      paymentErrorCode: errorCode ?? null,
      paymentErrorMessage: errorMessage ?? null,
    },
    {
      where: { providerCheckoutSessionId: checkoutSessionId, status: "pending" },
    }
  );
}

export async function finalizeOrderPaymentByCheckoutSessionId(
  checkoutSessionId: string,
  providerPaymentIntentId?: string,
  cardBrand?: string | null,
  cardLast4?: string | null
) {
  return sequelize.transaction(async (transaction) => {
    const order = await Order.findOne({
      where: { providerCheckoutSessionId: checkoutSessionId },
      include: ORDER_ITEMS_INCLUDE,
      transaction,
    });

    if (!order) {
      throw new AppError(404, "ORDER_NOT_FOUND", "Order not found for checkout session");
    }

    const userId = Number(order.get("userId"));
    await applyPaidTransition(order, userId, transaction, providerPaymentIntentId ?? null);
    await order.update(
      {
        cardBrand: cardBrand ?? null,
        cardLast4: cardLast4 ?? null,
      },
      { transaction }
    );

    return getOrderByIdForUpdate(Number(order.get("id")), transaction);
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
        cancelledAt: new Date(),
      },
      { transaction }
    );

    return getUserOrderByIdForUpdate(userId, orderId, transaction);
  });
}
