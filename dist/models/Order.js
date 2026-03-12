"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const Users_1 = __importDefault(require("./Users"));
const OrderItem_1 = __importDefault(require("./OrderItem"));
class Order extends sequelize_1.Model {
    id;
    orderNumber;
    userId;
    status;
    subtotal;
    discountAmount;
    totalAmount;
    paymentMethod;
    createdAt;
}
Order.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    orderNumber: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        field: "order_number",
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        field: "user_id",
    },
    status: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "pending",
    },
    subtotal: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    discountAmount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        field: "discount_amount",
    },
    totalAmount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: "total_amount",
    },
    paymentMethod: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
        field: "payment_method",
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
        field: "created_at",
    },
}, {
    sequelize: database_1.default,
    tableName: "orders",
    timestamps: false,
    indexes: [
        { fields: ["order_number"] },
        { fields: ["user_id"] },
        { fields: ["status"] },
        { fields: ["created_at"] },
    ],
});
Order.belongsTo(Users_1.default, { foreignKey: "user_id", as: "user" });
Order.hasMany(OrderItem_1.default, { foreignKey: "order_id", as: "items" });
exports.default = Order;
