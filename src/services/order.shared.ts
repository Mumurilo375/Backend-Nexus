import GameKey from "../models/GameKey";
import GamePlatformListing from "../models/GamePlatformListing";
import Games from "../models/Games";
import Order from "../models/Order";
import OrderItem from "../models/OrderItem";
import Platform from "../models/Platform";
import Users from "../models/Users";
import { toNumber } from "../utils/money";

export const LISTING_WITH_GAME_AND_PLATFORM_INCLUDE = {
  model: GamePlatformListing,
  as: "listing",
  include: [
    { model: Games, as: "game" },
    { model: Platform, as: "platform" },
  ],
};

export const GAME_KEY_INCLUDE = { model: GameKey, as: "gameKey" };

export const ORDER_ITEMS_WITH_LISTING_AND_KEY_INCLUDE = [
  LISTING_WITH_GAME_AND_PLATFORM_INCLUDE,
  GAME_KEY_INCLUDE,
];

export const ORDER_WITH_ITEMS_INCLUDE = [
  {
    model: OrderItem,
    as: "items",
    include: ORDER_ITEMS_WITH_LISTING_AND_KEY_INCLUDE,
  },
];

export const ADMIN_ORDER_LIST_INCLUDE = [
  {
    model: Users,
    as: "user",
    attributes: ["id", "username", "email", "fullName"],
    required: true,
  },
  {
    model: OrderItem,
    as: "items",
    attributes: ["id"],
    separate: true,
  },
];

export const ADMIN_ORDER_DETAILS_INCLUDE = [
  {
    model: Users,
    as: "user",
    attributes: ["id", "username", "email", "fullName", "cpf"],
    required: true,
  },
  {
    model: OrderItem,
    as: "items",
    include: [
      {
        model: GamePlatformListing,
        as: "listing",
        include: [
          { model: Games, as: "game", attributes: ["id", "title", "coverImageUrl"] },
          { model: Platform, as: "platform", attributes: ["id", "name", "slug"] },
        ],
      },
    ],
  },
];

function serializeUser(user: Users | undefined, includeCpf = false) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    ...(includeCpf ? { cpf: user.cpf } : {}),
  };
}

function serializeListing(listing: GamePlatformListing | undefined) {
  if (!listing) {
    return null;
  }

  const game = listing.get("game") as Games | undefined;
  const platform = listing.get("platform") as Platform | undefined;

  return {
    id: listing.id,
    price: toNumber(listing.price),
    isActive: listing.isActive,
    game: game
      ? {
          id: game.id,
          title: game.title,
          coverImageUrl: game.coverImageUrl,
        }
      : null,
    platform: platform
      ? {
          id: platform.id,
          name: platform.name,
          slug: platform.slug,
        }
      : null,
  };
}

export function serializeAdminOrderSummary(order: Order) {
  const user = order.get("user") as Users | undefined;
  const items = (order.get("items") as OrderItem[] | undefined) ?? [];

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    totalAmount: toNumber(order.totalAmount),
    createdAt: order.createdAt,
    itemCount: items.length,
    user: serializeUser(user),
  };
}

export function serializeAdminOrderDetails(order: Order) {
  const user = order.get("user") as Users | undefined;
  const items = ((order.get("items") as OrderItem[] | undefined) ?? []).sort(
    (firstItem, secondItem) => firstItem.id - secondItem.id,
  );

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    subtotal: toNumber(order.subtotal),
    discountAmount: toNumber(order.discountAmount),
    totalAmount: toNumber(order.totalAmount),
    paymentMethod: order.paymentMethod,
    createdAt: order.createdAt,
    paymentConfirmedAt: order.paymentConfirmedAt,
    cancelledAt: order.cancelledAt,
    user: serializeUser(user, true),
    items: items.map((item) => ({
      id: item.id,
      listingId: item.listingId,
      price: toNumber(item.price),
      createdAt: item.createdAt,
      listing: serializeListing(item.get("listing") as GamePlatformListing | undefined),
    })),
  };
}
