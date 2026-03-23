import Games from "../models/Games";
import Wishlist from "../models/Wishlist";
import { AppError } from "../utils/app-error";

export async function listUserWishlist(userId: number) {
  const items = await Wishlist.findAll({
    where: { userId },
    include: [{ model: Games, as: "game" }],
    order: [["addedAt", "DESC"]],
  });

  return {
    items,
    total: items.length,
  };
}

export async function addGameToWishlist(userId: number, gameId: number) {
  const gameExists = await Games.findByPk(gameId);
  if (!gameExists) {
    throw new AppError(404, "GAME_NOT_FOUND", "Game not found");
  }

  const [item] = await Wishlist.findOrCreate({
    where: { userId, gameId },
    defaults: { userId, gameId },
  });

  return item;
}

export async function removeGameFromWishlist(userId: number, gameId: number) {
  await Wishlist.destroy({
    where: { userId, gameId },
  });
}
