import { Op, Transaction } from "sequelize";
import CartItem from "../models/CartItem";
import GameCategory from "../models/GameCategory";
import GameImages from "../models/Game_images";
import GameKey from "../models/GameKey";
import GamePlatformListing from "../models/GamePlatformListing";
import GameTag from "../models/GameTag";
import ListingPriceChange from "../models/ListingPriceChange";
import OrderItem from "../models/OrderItem";
import PromotionListing from "../models/PromotionListing";
import Review from "../models/Review";
import ReviewVote from "../models/ReviewVote";
import Wishlist from "../models/Wishlist";
import { AppError } from "../utils/app-error";

async function ensureGameHasNoOrders(listingIds: number[], transaction: Transaction) {
  if (!listingIds.length) {
    return;
  }

  const orderCount = await OrderItem.count({
    where: { listingId: { [Op.in]: listingIds } },
    transaction,
  });

  if (orderCount > 0) {
    throw new AppError(
      409,
      "GAME_HAS_ORDER_HISTORY",
      "Game cannot be deleted because it has order history",
    );
  }
}

export async function deleteGameDependencies(gameId: number, transaction: Transaction) {
  const [images, listings, reviews] = await Promise.all([
    GameImages.findAll({ where: { gameId }, transaction }),
    GamePlatformListing.findAll({
      where: { gameId },
      attributes: ["id"],
      transaction,
    }),
    Review.findAll({
      where: { gameId },
      attributes: ["id"],
      transaction,
    }),
  ]);
  const listingIds = listings.map(({ id }) => id);
  const reviewIds = reviews.map(({ id }) => id);

  await ensureGameHasNoOrders(listingIds, transaction);

  if (reviewIds.length) {
    await ReviewVote.destroy({
      where: { reviewId: { [Op.in]: reviewIds } },
      transaction,
    });
  }

  if (listingIds.length) {
    await Promise.all([
      PromotionListing.destroy({
        where: { listingId: { [Op.in]: listingIds } },
        transaction,
      }),
      ListingPriceChange.destroy({
        where: { listingId: { [Op.in]: listingIds } },
        transaction,
      }),
      CartItem.destroy({
        where: { listingId: { [Op.in]: listingIds } },
        transaction,
      }),
      GameKey.destroy({
        where: { listingId: { [Op.in]: listingIds } },
        transaction,
      }),
    ]);

    await GamePlatformListing.destroy({ where: { gameId }, transaction });
  }

  await Promise.all([
    Review.destroy({ where: { gameId }, transaction }),
    Wishlist.destroy({ where: { gameId }, transaction }),
    GameTag.destroy({ where: { gameId }, transaction }),
    GameImages.destroy({ where: { gameId }, transaction }),
    GameCategory.destroy({ where: { gameId }, transaction }),
  ]);

  return images;
}
