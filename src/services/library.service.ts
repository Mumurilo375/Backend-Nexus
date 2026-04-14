import { Op } from "sequelize";
import Order from "../models/Order";
import OrderItem from "../models/OrderItem";
import { buildPaginationMeta, getPaginationOffset } from "../utils/pagination";
import {
  GAME_KEY_INCLUDE,
  LISTING_WITH_GAME_AND_PLATFORM_INCLUDE,
} from "./order.shared";
import { ListLibraryQuery } from "../validators/library.validator";

export async function listUserLibraryKeys(userId: number, query: ListLibraryQuery) {
  const result = await OrderItem.findAndCountAll({
    where: { gameKeyId: { [Op.ne]: null } },
    limit: query.limit,
    offset: getPaginationOffset(query.page, query.limit),
    order: [["id", "DESC"]],
    include: [
      {
        model: Order,
        as: "order",
        where: { userId, status: "paid" },
        required: true,
      },
      LISTING_WITH_GAME_AND_PLATFORM_INCLUDE,
      GAME_KEY_INCLUDE,
    ],
  });

  return {
    items: result.rows,
    meta: buildPaginationMeta(query, result.count),
  };
}
