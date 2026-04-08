import CartItem from "../models/CartItem";
import GamePlatformListing from "../models/GamePlatformListing";
import Games from "../models/Games";
import Platform from "../models/Platform";
import { AppError } from "../utils/app-error";
import { countAvailableGameKeys, countListingStockSummary } from "../utils/stock";

function toNumber(value: unknown): number {
  return Number(value) || 0;
}

function getCartQuantity(item: CartItem): number {
  return Math.max(1, toNumber(item.get("quantity")));
}

function getStockErrorMessage(availableStock: number) {
  if (availableStock <= 0) {
    return "Esse jogo ficou sem estoque no momento.";
  }

  if (availableStock === 1) {
    return "So existe 1 unidade disponivel para esse jogo/plataforma.";
  }

  return `So existem ${availableStock} unidades disponiveis para esse jogo/plataforma.`;
}

async function getListingOrFail(listingId: number) {
  const listing = await GamePlatformListing.findByPk(listingId);

  if (!listing || !listing.get("isActive")) {
    throw new AppError(404, "LISTING_NOT_FOUND", "Item indisponivel.");
  }

  return listing;
}

async function getAvailableStock(listingId: number): Promise<number> {
  return countAvailableGameKeys(listingId);
}

async function ensureAvailableStock(listingId: number, quantity: number) {
  const availableStock = await getAvailableStock(listingId);

  if (availableStock < quantity) {
    throw new AppError(
      409,
      "OUT_OF_STOCK",
      getStockErrorMessage(availableStock),
    );
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
  const serializedItems = await Promise.all(
    cartItems.map(async (item) => {
      const quantity = getCartQuantity(item);
      const listingId = Number(item.get("listingId"));
      const stock = await countListingStockSummary(listingId);

      return {
        ...item.toJSON(),
        quantity,
        stock,
        isQuantityAvailable: stock.available >= quantity,
      };
    }),
  );

  const subtotal = serializedItems.reduce(
    (sum, item) => sum + toNumber(item.listing?.price) * quantityFromItem(item),
    0,
  );
  const totalItems = serializedItems.reduce(
    (sum, item) => sum + quantityFromItem(item),
    0,
  );

  return {
    items: serializedItems,
    meta: {
      totalItems,
      subtotal,
      hasStockIssues: serializedItems.some(
        (item) => item.isQuantityAvailable === false,
      ),
    },
  };
}

function quantityFromItem(item: { quantity?: number }) {
  return Math.max(1, toNumber(item.quantity));
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

  const item = await CartItem.findOne({
    where: { userId, listingId },
  });

  if (!item) {
    throw new AppError(404, "CART_ITEM_NOT_FOUND", "Item nao encontrado no carrinho.");
  }

  await ensureAvailableStock(listingId, quantity);

  await item.update({ quantity });
  return item;
}

export async function removeListingFromCart(userId: number, listingId: number) {
  await CartItem.destroy({ where: { userId, listingId } });
}

export async function clearUserCart(userId: number) {
  await CartItem.destroy({ where: { userId } });
}
