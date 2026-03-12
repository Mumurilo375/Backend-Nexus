"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const Review_1 = __importDefault(require("./Review"));
const ReviewVote_1 = __importDefault(require("./ReviewVote"));
const CartItem_1 = __importDefault(require("./CartItem"));
const Wishlist_1 = __importDefault(require("./Wishlist"));
const Order_1 = __importDefault(require("./Order"));
const DeliveredKey_1 = __importDefault(require("./DeliveredKey"));
class Users extends sequelize_1.Model {
    id;
    email;
    username;
    fullName;
    cpf;
    avatarUrl;
    isAdmin;
    createdAt;
    updatedAt;
    passwordHash;
}
Users.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        unique: true,
    },
    username: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    passwordHash: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        field: "password_hash",
    },
    fullName: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
        field: "full_name",
    },
    cpf: {
        type: sequelize_1.DataTypes.STRING(14),
        allowNull: true,
        unique: true,
    },
    avatarUrl: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: true,
        field: "avatar_url",
    },
    isAdmin: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "is_admin",
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
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
        { fields: ["email"] },
        { fields: ["username"] },
        { fields: ["cpf"] },
    ],
});
Users.hasMany(Review_1.default, { foreignKey: "user_id", as: "reviews" });
Users.hasMany(ReviewVote_1.default, { foreignKey: "user_id", as: "reviewVotes" });
Users.hasMany(CartItem_1.default, { foreignKey: "user_id", as: "cartItems" });
Users.hasMany(Wishlist_1.default, { foreignKey: "user_id", as: "wishlistItems" });
Users.hasMany(Order_1.default, { foreignKey: "user_id", as: "orders" });
Users.hasMany(DeliveredKey_1.default, { foreignKey: "user_id", as: "deliveredKeys" });
exports.default = Users;
