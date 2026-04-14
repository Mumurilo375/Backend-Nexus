import { Transaction } from "sequelize";
import sequelize from "../config/database";
import CartItem from "../models/CartItem";
import DeliveredKey from "../models/DeliveredKey";
import GameKey from "../models/GameKey";
import GamePlatformListing from "../models/GamePlatformListing";
import Order from "../models/Order";
import OrderItem from "../models/OrderItem";
import { AppError } from "../utils/app-error";
import { buildPricing, roundMoney, toNumber } from "../utils/money";
import { findAvailableGameKeysForCheckout } from "../utils/stock";
import { CheckoutInput } from "../validators/checkout.validator";
import { getActiveDiscountPercentage } from "./catalog.shared";
import { ORDER_WITH_ITEMS_INCLUDE } from "./order.shared";

type CartItemWithListing = CartItem & {
  listing?: GamePlatformListing;
};

type SelectedCheckoutItem = {
  listing: GamePlatformListing;
  gameKeys: GameKey[];
  finalPrice: number;
  quantity: number;
};

function generateOrderNumber(userId: number): string {
  return `NEX-${userId}-${Date.now()}`;
}

function ensureListingIsAvailable(listing: GamePlatformListing | undefined) {
  if (!listing || !listing.get("isActive")) {
    throw new AppError(
      409,
      "LISTING_UNAVAILABLE",
      "Um item do seu carrinho nao esta mais disponivel.",
    );
  }

  return listing;
}

function readCartQuantity(cartItem: CartItem) {
  return Math.max(1, toNumber(cartItem.get("quantity")));
}

async function loadUserCartItems(userId: number, transaction: Transaction) {
  const cartItems = await CartItem.findAll({
    where: { userId },
    include: [
      {
        model: GamePlatformListing,
        as: "listing",
      },
    ],
    order: [["id", "ASC"]],
    transaction,
  });

  if (cartItems.length === 0) {
    throw new AppError(400, "CART_EMPTY", "Seu carrinho esta vazio.");
  }

  return cartItems as CartItemWithListing[];
}

async function selectCheckoutItems(
  cartItems: CartItemWithListing[],
  transaction: Transaction,
) {
  const selectedItems: SelectedCheckoutItem[] = [];
  let subtotal = 0;
  let discountAmount = 0;

  for (const cartItem of cartItems) {
    const listing = ensureListingIsAvailable(cartItem.listing);
    const listingId = toNumber(listing.id);
    const basePrice = toNumber(listing.get("price"));

    if (basePrice <= 0) {
      throw new AppError(400, "INVALID_PRICE", "Preco invalido para um item do carrinho.");
    }

    const quantity = readCartQuantity(cartItem);
    const gameKeys = await findAvailableGameKeysForCheckout(listingId, quantity, transaction);

    if (gameKeys.length < quantity) {
      throw new AppError(
        409,
        "OUT_OF_STOCK",
        "O estoque do carrinho mudou. Revise as quantidades antes de finalizar o pedido.",
      );
    }

    const pricing = buildPricing(
      basePrice,
      await getActiveDiscountPercentage(listingId, transaction),
    );

    selectedItems.push({
      listing,
      gameKeys,
      finalPrice: pricing.finalPrice,
      quantity,
    });

    subtotal += roundMoney(basePrice * quantity);
    discountAmount += roundMoney(pricing.discountAmount * quantity);
  }

  const roundedSubtotal = roundMoney(subtotal);
  const roundedDiscountAmount = roundMoney(discountAmount);

  return {
    selectedItems,
    subtotal: roundedSubtotal,
    discountAmount: roundedDiscountAmount,
    totalAmount: roundMoney(roundedSubtotal - roundedDiscountAmount),
  };
}

async function createPaidOrder(params: {
  userId: number;
  input: CheckoutInput;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  now: Date;
  transaction: Transaction;
}) {
  return Order.create(
    {
      orderNumber: generateOrderNumber(params.userId),
      userId: params.userId,
      status: "paid",
      subtotal: params.subtotal,
      discountAmount: params.discountAmount,
      totalAmount: params.totalAmount,
      paymentMethod: params.input.paymentMethod,
      paymentStatus: "succeeded",
      paymentConfirmedAt: params.now,
    },
    { transaction: params.transaction },
  );
}

async function deliverPurchasedKeys(params: {
  orderId: number;
  userId: number;
  selectedItems: SelectedCheckoutItem[];
  now: Date;
  transaction: Transaction;
}) {
  for (const selectedItem of params.selectedItems) {
    for (const gameKey of selectedItem.gameKeys) {
      await gameKey.update(
        {
          status: "sold",
          reservedAt: null,
          soldAt: params.now,
        },
        { transaction: params.transaction },
      );

      const orderItem = await OrderItem.create(
        {
          orderId: params.orderId,
          listingId: toNumber(selectedItem.listing.id),
          gameKeyId: toNumber(gameKey.id),
          price: selectedItem.finalPrice,
        },
        { transaction: params.transaction },
      );

      await DeliveredKey.create(
        {
          userId: params.userId,
          orderItemId: toNumber(orderItem.get("id")),
          gameKeyId: toNumber(gameKey.get("id")),
          deliveredAt: params.now,
        },
        { transaction: params.transaction },
      );
    }
  }
}

async function loadCreatedOrderOrFail(
  orderId: number,
  transaction: Transaction,
) {
  const createdOrder = await Order.findByPk(orderId, {
    include: ORDER_WITH_ITEMS_INCLUDE,
    transaction,
  });

  if (!createdOrder) {
    throw new AppError(
      500,
      "ORDER_NOT_FOUND_AFTER_CREATE",
      "O pedido foi criado, mas nao foi possivel carregar os dados finais.",
    );
  }

  return createdOrder;
}

export async function checkoutUserCart(userId: number, input: CheckoutInput) {
  return sequelize.transaction(async (transaction) => {
    const cartItems = await loadUserCartItems(userId, transaction);
    const pricing = await selectCheckoutItems(cartItems, transaction);
    const now = new Date();

    const order = await createPaidOrder({
      userId,
      input,
      subtotal: pricing.subtotal,
      discountAmount: pricing.discountAmount,
      totalAmount: pricing.totalAmount,
      now,
      transaction,
    });

    await deliverPurchasedKeys({
      orderId: toNumber(order.get("id")),
      userId,
      selectedItems: pricing.selectedItems,
      now,
      transaction,
    });

    await CartItem.destroy({ where: { userId }, transaction });

    return {
      order: await loadCreatedOrderOrFail(toNumber(order.get("id")), transaction),
    };
  });
}
