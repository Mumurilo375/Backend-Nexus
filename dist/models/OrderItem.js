"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const Order_1 = __importDefault(require("./Order"));
const GamePlatformListing_1 = __importDefault(require("./GamePlatformListing"));
const GameKey_1 = __importDefault(require("./GameKey"));
const DeliveredKey_1 = __importDefault(require("./DeliveredKey"));
class OrderItem extends sequelize_1.Model {
    id;
    orderId;
    listingId;
    gameKeyId;
    price;
    createdAt;
}
OrderItem.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    orderId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        field: "order_id",
    },
    listingId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        field: "listing_id",
    },
    gameKeyId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        field: "game_key_id",
        unique: true,
    },
    price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
        field: "created_at",
    },
}, {
    sequelize: database_1.default,
    tableName: "order_items",
    timestamps: false,
    indexes: [
        { fields: ["order_id"] },
        { fields: ["listing_id"] },
        { fields: ["game_key_id"] },
    ],
});
OrderItem.belongsTo(Order_1.default, { foreignKey: "order_id", as: "order" });
OrderItem.belongsTo(GamePlatformListing_1.default, { foreignKey: "listing_id", as: "listing" });
OrderItem.belongsTo(GameKey_1.default, { foreignKey: "game_key_id", as: "gameKey" });
OrderItem.hasOne(DeliveredKey_1.default, { foreignKey: "order_item_id", as: "deliveredKey" });
exports.default = OrderItem;
