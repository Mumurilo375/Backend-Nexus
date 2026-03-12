"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const Games_1 = __importDefault(require("./Games"));
const Platform_1 = __importDefault(require("./Platform"));
const GameKey_1 = __importDefault(require("./GameKey"));
const CartItem_1 = __importDefault(require("./CartItem"));
const OrderItem_1 = __importDefault(require("./OrderItem"));
const Promotion_1 = __importDefault(require("./Promotion"));
class GamePlatformListing extends sequelize_1.Model {
    id;
    gameId;
    platformId;
    price;
    isActive;
    createdAt;
    updatedAt;
}
GamePlatformListing.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    gameId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        field: "game_id",
    },
    platformId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        field: "platform_id",
    },
    price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "is_active",
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
        field: "created_at",
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
        field: "updated_at",
    },
}, {
    sequelize: database_1.default,
    tableName: "game_platform_listings",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
        { unique: true, fields: ["game_id", "platform_id"] },
        { fields: ["game_id"] },
        { fields: ["platform_id"] },
        { fields: ["is_active"] },
    ],
});
GamePlatformListing.belongsTo(Games_1.default, { foreignKey: "game_id", as: "game" });
GamePlatformListing.belongsTo(Platform_1.default, { foreignKey: "platform_id", as: "platform" });
GamePlatformListing.hasMany(GameKey_1.default, { foreignKey: "listing_id", as: "gameKeys" });
GamePlatformListing.hasMany(CartItem_1.default, { foreignKey: "listing_id", as: "cartItems" });
GamePlatformListing.hasMany(OrderItem_1.default, { foreignKey: "listing_id", as: "orderItems" });
GamePlatformListing.belongsToMany(Promotion_1.default, { through: "PromotionListings", foreignKey: "listing_id", as: "promotions" });
exports.default = GamePlatformListing;
