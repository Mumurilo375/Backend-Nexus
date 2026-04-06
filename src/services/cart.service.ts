import CartItem from "../models/CartItem";
import GameKey from "../models/GameKey";
import GamePlatformListing from "../models/GamePlatformListing";
import Games from "../models/Games";
import Platform from "../models/Platform";
import { AppError } from "../utils/app-error";

function toNumber(value: unknown): number {
  return Number(value) || 0;
}

function getCartQuantity(item: CartItem): number {
  return Math.max(1, toNumber(item.get("quantity")));
}

async function getListingOrFail(listingId: number) {
  const listing = await GamePlatformListing.findByPk(listingId);

  if (!listing || !listing.get("isActive")) {
    throw new AppError(404, "LISTING_NOT_FOUND", "Listing not found");
  }

  return listing;
}

async function getAvailableStock(listingId: number): Promise<number> {
  return GameKey.count({
    where: {
      listingId,
      status: "available",
    },
  });
}

async function ensureAvailableStock(listingId: number, quantity: number) {
  const availableStock = await getAvailableStock(listingId);

  if (availableStock < quantity) {
    throw new AppError(409, "OUT_OF_STOCK", "Not enough available keys for this listing");
  }
}

export async function listUserCart(userId: number) {
  const items = await CartItem.findAll({
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
    order: [["addedAt", "DESC"]],
  });

  const cartItems = items as Array<CartItem & { listing?: GamePlatformListing }>;
  const subtotal = cartItems.reduce(
    (sum, item) => sum + toNumber(item.listing?.get("price")) * getCartQuantity(item),
    0,
  );
  const totalItems = cartItems.reduce((sum, item) => sum + getCartQuantity(item), 0);

  return {
    items: cartItems,
    meta: {
      totalItems,
      subtotal,
    },
  };
}

export async function addListingToCart(userId: number, listingId: number) {
  await getListingOrFail(listingId);

  const item = await CartItem.findOne({
    where: { userId, listingId },
  });

  if (!item) {
    await ensureAvailableStock(listingId, 1);
    return CartItem.create({ userId, listingId, quantity: 1 });
  }

  const nextQuantity = getCartQuantity(item) + 1;
  await ensureAvailableStock(listingId, nextQuantity);
  await item.update({ quantity: nextQuantity });

  return item;
}

export async function updateCartItemQuantity(userId: number, listingId: number, quantity: number) {
  await getListingOrFail(listingId);
  await ensureAvailableStock(listingId, quantity);

  const item = await CartItem.findOne({
    where: { userId, listingId },
  });

  if (!item) {
    throw new AppError(404, "CART_ITEM_NOT_FOUND", "Cart item not found");
  }

  await item.update({ quantity });
  return item;
}

export async function removeListingFromCart(userId: number, listingId: number) {
  await CartItem.destroy({ where: { userId, listingId } });
}

export async function clearUserCart(userId: number) {
  await CartItem.destroy({ where: { userId } });
}
