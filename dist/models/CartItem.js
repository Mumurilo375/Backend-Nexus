"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const Users_1 = __importDefault(require("./Users"));
const GamePlatformListing_1 = __importDefault(require("./GamePlatformListing"));
class CartItem extends sequelize_1.Model {
    id;
    userId;
    listingId;
    addedAt;
}
CartItem.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        field: "user_id",
    },
    listingId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        field: "listing_id",
    },
    addedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
        field: "added_at",
    },
}, {
    sequelize: database_1.default,
    tableName: "cart_items",
    timestamps: false,
    indexes: [
        { unique: true, fields: ["user_id", "listing_id"] },
        { fields: ["user_id"] },
    ],
});
CartItem.belongsTo(Users_1.default, { foreignKey: "user_id", as: "user" });
CartItem.belongsTo(GamePlatformListing_1.default, { foreignKey: "listing_id", as: "listing" });
exports.default = CartItem;
