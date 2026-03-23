import sequelize from "../config/database";
import CartItem from "../models/CartItem";
import DeliveredKey from "../models/DeliveredKey";
import GameKey from "../models/GameKey";
import GamePlatformListing from "../models/GamePlatformListing";
import Games from "../models/Games";
import Order from "../models/Order";
import OrderItem from "../models/OrderItem";
import Platform from "../models/Platform";
import { AppError } from "../utils/app-error";
import { CheckoutInput } from "../validators/checkout.validator";

function toNumber(value: unknown): number {
  return Number(value) || 0;
}

function generateOrderNumber(userId: number): string {
  return `NEX-${userId}-${Date.now()}`;
}

export async function checkoutUserCart(userId: number, input: CheckoutInput) {
  return sequelize.transaction(async (transaction) => {
    const cartItems = await CartItem.findAll({
      where: { userId },
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
      order: [["id", "ASC"]],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (cartItems.length === 0) {
      throw new AppError(400, "CART_EMPTY", "Cart is empty");
    }

    const selectedItems: Array<{ listing: GamePlatformListing; gameKey: GameKey }> = [];
    let subtotal = 0;

    for (const cartItem of cartItems as Array<CartItem & { listing?: GamePlatformListing }>) {
      const listing = cartItem.listing;

      if (!listing || !listing.get("isActive")) {
        throw new AppError(409, "LISTING_UNAVAILABLE", "A cart item is unavailable");
      }

      const gameKey = await GameKey.findOne({
        where: {
          listingId: Number(listing.get("id")),
          status: "available",
        },
        order: [["id", "ASC"]],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!gameKey) {
        throw new AppError(409, "OUT_OF_STOCK", "No available keys for one of the selected items");
      }

      selectedItems.push({ listing, gameKey });
      subtotal += toNumber(listing.get("price"));
    }

    const order = await Order.create(
      {
        orderNumber: generateOrderNumber(userId),
        userId,
        status: "paid",
        subtotal,
        discountAmount: 0,
        totalAmount: subtotal,
        paymentMethod: input.paymentMethod,
      },
      { transaction }
    );

    for (const selected of selectedItems) {
      const now = new Date();
      await selected.gameKey.update(
        {
          status: "sold",
          reservedAt: now,
          soldAt: now,
        },
        { transaction }
      );

      const orderItem = await OrderItem.create(
        {
          orderId: Number(order.get("id")),
          listingId: Number(selected.listing.get("id")),
          gameKeyId: Number(selected.gameKey.get("id")),
          price: toNumber(selected.listing.get("price")),
        },
        { transaction }
      );

      await DeliveredKey.create(
        {
          userId,
          orderItemId: Number(orderItem.get("id")),
          gameKeyId: Number(selected.gameKey.get("id")),
          deliveredAt: now,
        },
        { transaction }
      );
    }

    await CartItem.destroy({ where: { userId }, transaction });

    const createdOrder = await Order.findByPk(order.get("id"), {
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
            { model: GameKey, as: "gameKey" },
          ],
        },
      ],
      transaction,
    });

    return createdOrder;
  });
}
