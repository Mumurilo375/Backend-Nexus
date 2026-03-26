import { Op } from "sequelize";
import GameKey from "../models/GameKey";
import GamePlatformListing from "../models/GamePlatformListing";
import Games from "../models/Games";
import Order from "../models/Order";
import OrderItem from "../models/OrderItem";
import Platform from "../models/Platform";
import { ListLibraryQuery } from "../validators/library.validator";

export async function listUserLibraryKeys(userId: number, query: ListLibraryQuery) {
  const offset = (query.page - 1) * query.limit;

  const result = await OrderItem.findAndCountAll({
    where: { gameKeyId: { [Op.ne]: null } },
    limit: query.limit,
    offset,
    order: [["id", "DESC"]],
    include: [
      {
        model: Order,
        as: "order",
        where: { userId, status: "paid" },
        required: true,
      },
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
