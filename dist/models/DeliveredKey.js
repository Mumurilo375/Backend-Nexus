"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const Users_1 = __importDefault(require("./Users"));
const GameKey_1 = __importDefault(require("./GameKey"));
const OrderItem_1 = __importDefault(require("./OrderItem"));
class DeliveredKey extends sequelize_1.Model {
    id;
    userId;
    orderItemId;
    gameKeyId;
    deliveredAt;
}
DeliveredKey.init({
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
    orderItemId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        field: "order_item_id",
    },
    gameKeyId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        field: "game_key_id",
    },
    deliveredAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
        field: "delivered_at",
    },
}, {
    sequelize: database_1.default,
    tableName: "delivered_keys",
    timestamps: false,
    indexes: [
        { fields: ["user_id"] },
        { fields: ["order_item_id"] },
        { fields: ["game_key_id"] },
    ],
});
DeliveredKey.belongsTo(Users_1.default, { foreignKey: "user_id", as: "user" });
DeliveredKey.hasOne(OrderItem_1.default, { foreignKey: "order_item_id", as: "orderItem" });
DeliveredKey.hasOne(GameKey_1.default, { foreignKey: "game_key_id", as: "gameKey" });
exports.default = DeliveredKey;
