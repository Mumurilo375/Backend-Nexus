import { Op } from "sequelize";
import Games from "../models/Games";
import GamePlatformListing from "../models/GamePlatformListing";
import Order from "../models/Order";
import OrderItem from "../models/OrderItem";
import Platform from "../models/Platform";
import Users from "../models/Users";
import { AppError } from "../utils/app-error";
import { ListAdminOrdersQuery } from "../validators/admin-order.validator";

function toMoneyNumber(value: unknown) {
  return Number(value) || 0;
}

function buildOrderFilters(query: ListAdminOrdersQuery) {
  const filters: { [key: string]: unknown; [Op.or]?: unknown } = {};

  if (query.status) {
    filters.status = query.status;
  }

  if (query.paymentStatus) {
    filters.paymentStatus = query.paymentStatus;
  }

  if (query.q) {
    filters[Op.or] = [
      { orderNumber: { [Op.iLike]: `%${query.q}%` } },
      { "$user.email$": { [Op.iLike]: `%${query.q}%` } },
      { "$user.username$": { [Op.iLike]: `%${query.q}%` } },
    ];
  }

  return filters;
}

export async function listAdminOrders(query: ListAdminOrdersQuery) {
  const offset = (query.page - 1) * query.limit;

  const result = await Order.findAndCountAll({
    where: buildOrderFilters(query),
    limit: query.limit,
    offset,
    order: [["createdAt", "DESC"], ["id", "DESC"]],
    include: [
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
        order: [["id", "ASC"]],
      },
    ],
  });

  return {
    items: result.rows.map((order) => {
      const user = order.get("user") as Users | undefined;
      const items = (order.get("items") as OrderItem[] | undefined) ?? [];

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalAmount: toMoneyNumber(order.totalAmount),
        createdAt: order.createdAt,
        itemCount: items.length,
        user: user
          ? {
              id: user.id,
              username: user.username,
              email: user.email,
              fullName: user.fullName,
            }
          : null,
      };
    }),
    meta: {
      page: query.page,
      limit: query.limit,
      total: result.count,
      totalPages: Math.ceil(result.count / query.limit),
    },
  };
}

export async function getAdminOrderById(orderId: number) {
  const order = await Order.findByPk(orderId, {
    include: [
      {
        model: Users,
        as: "user",
        attributes: ["id", "username", "email", "fullName", "cpf"],
        required: true,
      },
      {
        model: OrderItem,
        as: "items",
        order: [["id", "ASC"]],
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
    ],
  });

  if (!order) {
    throw new AppError(404, "ORDER_NOT_FOUND", "Order not found");
  }

  const user = order.get("user") as Users | undefined;
  const items = (order.get("items") as OrderItem[] | undefined) ?? [];

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    subtotal: toMoneyNumber(order.subtotal),
    discountAmount: toMoneyNumber(order.discountAmount),
    totalAmount: toMoneyNumber(order.totalAmount),
    paymentMethod: order.paymentMethod,
    createdAt: order.createdAt,
    paymentConfirmedAt: order.paymentConfirmedAt,
    cancelledAt: order.cancelledAt,
    user: user
      ? {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          cpf: user.cpf,
        }
      : null,
    items: items.map((item) => {
      const listing = item.get("listing") as GamePlatformListing | undefined;
      const game = listing?.get("game") as Games | undefined;
      const platform = listing?.get("platform") as Platform | undefined;

      return {
        id: item.id,
        listingId: item.listingId,
        price: toMoneyNumber(item.price),
        createdAt: item.createdAt,
        listing: listing
          ? {
              id: listing.id,
              price: toMoneyNumber(listing.price),
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
            }
          : null,
      };
    }),
  };
}
