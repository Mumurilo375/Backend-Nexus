"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const GamePlatformListing_1 = __importDefault(require("./GamePlatformListing"));
const OrderItem_1 = __importDefault(require("./OrderItem"));
const DeliveredKey_1 = __importDefault(require("./DeliveredKey"));
class GameKey extends sequelize_1.Model {
    id;
    listingId;
    keyValue;
    status;
    reservedAt;
    soldAt;
    createdAt;
}
GameKey.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    listingId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        field: "listing_id",
    },
    keyValue: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        field: "key_value",
    },
    status: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "available",
    },
    reservedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        field: "reserved_at",
    },
    soldAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        field: "sold_at",
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
        field: "created_at",
    },
}, {
    sequelize: database_1.default,
    tableName: "game_keys",
    timestamps: false,
    indexes: [
        { fields: ["listing_id"] },
        { fields: ["status"] },
        { fields: ["listing_id", "status"] },
    ],
});
GameKey.belongsTo(GamePlatformListing_1.default, { foreignKey: "listing_id", as: "listing" });
GameKey.hasOne(OrderItem_1.default, { foreignKey: "game_key_id", as: "orderItem" }); // pode ter 0 ou 1 OrderItem associado
GameKey.hasOne(DeliveredKey_1.default, { foreignKey: "game_key_id", as: "deliveredKey" }); // pode ter 0 ou 1 DeliveredKey associado, indicando se a chave foi entregue ou não
exports.default = GameKey;
