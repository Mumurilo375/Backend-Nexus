import { literal, Op, Transaction } from "sequelize";
import GameKey from "../models/GameKey";

const UNASSIGNED_KEY_FILTER = {
  [Op.notIn]: literal(
    "(SELECT order_items.game_key_id FROM order_items WHERE order_items.game_key_id IS NOT NULL)",
  ),
};

export async function countAvailableGameKeys(listingId: number): Promise<number> {
  return GameKey.count({
    where: {
      listingId,
      status: "available",
      id: UNASSIGNED_KEY_FILTER,
    },
  });
}

export async function findAvailableGameKeysForCheckout(
  listingId: number,
  quantity: number,
  transaction: Transaction,
) {
  return GameKey.findAll({
    where: {
      listingId,
      status: "available",
      id: UNASSIGNED_KEY_FILTER,
    },
    order: [["id", "ASC"]],
    limit: quantity,
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
}

export async function countListingStockSummary(listingId: number) {
  const [available, reserved, sold] = await Promise.all([
    countAvailableGameKeys(listingId),
    GameKey.count({ where: { listingId, status: "reserved" } }),
    GameKey.count({ where: { listingId, status: "sold" } }),
  ]);

  return {
    available,
    reserved,
    sold,
    total: available + reserved + sold,
  };
}
