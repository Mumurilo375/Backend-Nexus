import CartItem from "../models/CartItem";
import GamePlatformListing from "../models/GamePlatformListing";
import Games from "../models/Games";
import Platform from "../models/Platform";
import { AppError } from "../utils/app-error";

function toNumber(value: unknown): number {
  return Number(value) || 0;
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
  const subtotal = cartItems.reduce((sum, item) => sum + toNumber(item.listing?.get("price")), 0);

  return {
    items: cartItems,
    meta: {
      totalItems: cartItems.length,
      subtotal,
    },
  };
}

export async function addListingToCart(userId: number, listingId: number) {
  const listing = await GamePlatformListing.findByPk(listingId);

  if (!listing || !listing.get("isActive")) {
    throw new AppError(404, "LISTING_NOT_FOUND", "Listing not found");
  }

  const [item] = await CartItem.findOrCreate({
    where: { userId, listingId },
    defaults: { userId, listingId },
  });

  return item;
}

export async function removeListingFromCart(userId: number, listingId: number) {
  await CartItem.destroy({ where: { userId, listingId } });
}

export async function clearUserCart(userId: number) {
  await CartItem.destroy({ where: { userId } });
}
