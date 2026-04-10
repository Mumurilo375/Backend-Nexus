import CartItem from "./CartItem";
import Categories from "./Category";
import DeliveredKey from "./DeliveredKey";
import GameCategory from "./GameCategory";
import GameImages from "./Game_images";
import GameKey from "./GameKey";
import GamePlatformListing from "./GamePlatformListing";
import Games from "./Games";
import GameTag from "./GameTag";
import ListingPriceChange from "./ListingPriceChange";
import Order from "./Order";
import OrderItem from "./OrderItem";
import Platform from "./Platform";
import Promotion from "./Promotion";
import PromotionListing from "./PromotionListing";
import Review from "./Review";
import ReviewVote from "./ReviewVote";
import Tags from "./Tags";
import Users from "./Users";
import Wishlist from "./Wishlist";

// Centralized associations avoid circular import timing issues.

Categories.belongsToMany(Games, { through: "GameCategory", foreignKey: "category_id", as: "games" });
Categories.hasMany(GameCategory, { foreignKey: "category_id", as: "gameCategories" });

CartItem.belongsTo(Users, { foreignKey: "user_id", as: "user" });
CartItem.belongsTo(GamePlatformListing, { foreignKey: "listing_id", as: "listing" });

Games.hasMany(GameImages, { foreignKey: "game_id", as: "images" });
Games.hasMany(Review, { foreignKey: "game_id", as: "reviews" });
Games.hasMany(Wishlist, { foreignKey: "game_id", as: "wishlists" });
Games.hasMany(GamePlatformListing, { foreignKey: "game_id", as: "platformListings" });
Games.belongsToMany(Categories, { through: "GameCategory", foreignKey: "game_id", as: "categories" });
Games.belongsToMany(Tags, { through: "GameTag", foreignKey: "game_id", as: "tags" });

GamePlatformListing.belongsTo(Games, { foreignKey: "game_id", as: "game" });
GamePlatformListing.belongsTo(Platform, { foreignKey: "platform_id", as: "platform" });
GamePlatformListing.hasMany(GameKey, { foreignKey: "listing_id", as: "gameKeys" });
GamePlatformListing.hasMany(CartItem, { foreignKey: "listing_id", as: "cartItems" });
GamePlatformListing.hasMany(OrderItem, { foreignKey: "listing_id", as: "orderItems" });
GamePlatformListing.hasMany(ListingPriceChange, { foreignKey: "listing_id", as: "priceChanges" });
GamePlatformListing.belongsToMany(Promotion, {
  through: PromotionListing,
  foreignKey: "listing_id",
  otherKey: "promotion_id",
  as: "promotions",
});

GameCategory.belongsTo(Games, { foreignKey: "game_id", as: "game" });
GameCategory.belongsTo(Categories, { foreignKey: "category_id", as: "category" });

DeliveredKey.belongsTo(Users, { foreignKey: "user_id", as: "user" });
DeliveredKey.belongsTo(OrderItem, { foreignKey: "order_item_id", as: "orderItem" });
DeliveredKey.belongsTo(GameKey, { foreignKey: "game_key_id", as: "gameKey" });

GameTag.belongsTo(Games, { foreignKey: "game_id", as: "game" });
GameTag.belongsTo(Tags, { foreignKey: "tag_id", as: "tag" });

Platform.hasMany(GamePlatformListing, { foreignKey: "platform_id", as: "gameListings" });

OrderItem.belongsTo(Order, { foreignKey: "order_id", as: "order" });
OrderItem.belongsTo(GamePlatformListing, { foreignKey: "listing_id", as: "listing" });
OrderItem.belongsTo(GameKey, { foreignKey: "game_key_id", as: "gameKey" });
OrderItem.hasOne(DeliveredKey, { foreignKey: "order_item_id", as: "deliveredKey" });

Promotion.belongsToMany(GamePlatformListing, {
  through: PromotionListing,
  foreignKey: "promotion_id",
  otherKey: "listing_id",
  as: "listings",
});
Promotion.hasMany(PromotionListing, { foreignKey: "promotion_id", as: "promotionListings" });

GameImages.belongsTo(Games, { foreignKey: "game_id", as: "game" });

GameKey.belongsTo(GamePlatformListing, { foreignKey: "listing_id", as: "listing" });
GameKey.hasOne(OrderItem, { foreignKey: "game_key_id", as: "orderItem" });
GameKey.hasOne(DeliveredKey, { foreignKey: "game_key_id", as: "deliveredKey" });

Order.belongsTo(Users, { foreignKey: "user_id", as: "user" });
Order.hasMany(OrderItem, { foreignKey: "order_id", as: "items" });

Tags.belongsToMany(Games, { through: "GameTag", foreignKey: "tag_id", as: "games" });
Tags.hasMany(GameTag, { foreignKey: "tag_id", as: "gameTags" });

Review.belongsTo(Games, { foreignKey: "game_id", as: "game" });
Review.belongsTo(Users, { foreignKey: "user_id", as: "user" });
Review.hasMany(ReviewVote, { foreignKey: "review_id", as: "votes" });

Users.hasMany(Review, { foreignKey: "user_id", as: "reviews" });
Users.hasMany(ReviewVote, { foreignKey: "user_id", as: "reviewVotes" });
Users.hasMany(CartItem, { foreignKey: "user_id", as: "cartItems" });
Users.hasMany(Wishlist, { foreignKey: "user_id", as: "wishlistItems" });
Users.hasMany(Order, { foreignKey: "user_id", as: "orders" });
Users.hasMany(DeliveredKey, { foreignKey: "user_id", as: "deliveredKeys" });

ReviewVote.belongsTo(Review, { foreignKey: "review_id", as: "review" });
ReviewVote.belongsTo(Users, { foreignKey: "user_id", as: "user" });

PromotionListing.belongsTo(Promotion, { foreignKey: "promotion_id", as: "promotion" });
PromotionListing.belongsTo(GamePlatformListing, { foreignKey: "listing_id", as: "listing" });

ListingPriceChange.belongsTo(GamePlatformListing, { foreignKey: "listing_id", as: "listing" });
ListingPriceChange.belongsTo(Users, { foreignKey: "changed_by_user_id", as: "changedBy" });

Wishlist.belongsTo(Users, { foreignKey: "user_id", as: "user" });
Wishlist.belongsTo(Games, { foreignKey: "game_id", as: "game" });
