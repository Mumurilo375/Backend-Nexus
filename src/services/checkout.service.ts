import sequelize from "../config/database";
import { Op, Transaction } from "sequelize";
import CartItem from "../models/CartItem";
import DeliveredKey from "../models/DeliveredKey";
import GameKey from "../models/GameKey";
import GamePlatformListing from "../models/GamePlatformListing";
import Games from "../models/Games";
import Order from "../models/Order";
import OrderItem from "../models/OrderItem";
import Platform from "../models/Platform";
import Promotion from "../models/Promotion";
import PromotionListing from "../models/PromotionListing";
import { AppError } from "../utils/app-error";
import { CheckoutInput } from "../validators/checkout.validator";

function toNumber(value: unknown): number {
  return Number(value) || 0;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function generateOrderNumber(userId: number): string {
  return `NEX-${userId}-${Date.now()}`;
}

async function getActiveDiscountPercentage(listingId: number, transaction: Transaction): Promise<number> {
  const now = new Date();

  const links = await PromotionListing.findAll({
    where: { listingId },
    include: [
      {
        model: Promotion,
        as: "promotion",
        required: true,
        where: {
          isActive: true,
          startDate: { [Op.lte]: now },
          endDate: { [Op.gte]: now },
        },
      },
    ],
    transaction,
  });

  let maxDiscount = 0;

  for (const link of links) {
    const promotion = link.get("promotion") as Promotion | undefined;
    const discount = toNumber(promotion?.get("discountPercentage"));

    if (discount < 0 || discount > 100) {
      throw new AppError(400, "VALIDATION_ERROR", "Invalid promotion discount percentage");
    }

    if (discount > maxDiscount) {
      maxDiscount = discount;
    }
  }

  return maxDiscount;
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
    });

    if (cartItems.length === 0) {
      throw new AppError(400, "CART_EMPTY", "Cart is empty");
    }

    const selectedItems: Array<{ listing: GamePlatformListing; gameKey: GameKey; finalPrice: number }> = [];
    let subtotal = 0;
    let discountAmount = 0;
    const now = new Date();

    for (const cartItem of cartItems as Array<CartItem & { listing?: GamePlatformListing }>) {
      const listing = cartItem.listing;

      if (!listing || !listing.get("isActive")) {
        throw new AppError(409, "LISTING_UNAVAILABLE", "A cart item is unavailable");
      }

      const listingId = Number(listing.get("id"));
      const basePrice = toNumber(listing.get("price"));

      if (basePrice <= 0) {
        throw new AppError(400, "INVALID_PRICE", "Listing price must be greater than 0");
      }

      const gameKey = await GameKey.findOne({
        where: {
          listingId,
          status: "available",
        },
        order: [["id", "ASC"]],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!gameKey) {
        throw new AppError(409, "OUT_OF_STOCK", "No available keys for one of the selected items");
      }

      const discountPercentage = await getActiveDiscountPercentage(listingId, transaction);
      const lineDiscount = roundMoney((basePrice * discountPercentage) / 100);
      const lineFinalPrice = roundMoney(basePrice - lineDiscount);

      selectedItems.push({ listing, gameKey, finalPrice: lineFinalPrice });

      subtotal += basePrice;
      discountAmount += lineDiscount;
    }

    subtotal = roundMoney(subtotal);
    discountAmount = roundMoney(discountAmount);
    const totalAmount = roundMoney(subtotal - discountAmount);

    const order = await Order.create(
      {
        orderNumber: generateOrderNumber(userId),
        userId,
        status: "paid",
        subtotal,
        discountAmount,
        totalAmount,
        paymentMethod: input.paymentMethod,
        paymentStatus: "succeeded",
        paymentConfirmedAt: now,
      },
      { transaction }
    );

    for (const selected of selectedItems) {
      await selected.gameKey.update(
        {
          status: "sold",
          reservedAt: null,
          soldAt: now,
        },
        { transaction }
      );

      const orderItem = await OrderItem.create(
        {
          orderId: Number(order.get("id")),
          listingId: Number(selected.listing.get("id")),
          gameKeyId: Number(selected.gameKey.get("id")),
          price: selected.finalPrice,
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

    if (!createdOrder) {
      throw new AppError(500, "ORDER_NOT_FOUND_AFTER_CREATE", "Order was created but could not be loaded");
    }

    return {
      order: createdOrder,
    };
  });
}
