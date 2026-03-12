"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const Users_1 = __importDefault(require("./Users"));
const Games_1 = __importDefault(require("./Games"));
class Wishlist extends sequelize_1.Model {
    id;
    userId;
    gameId;
    addedAt;
}
Wishlist.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        field: "user_id",
    },
    gameId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        field: "game_id",
    },
    addedAt: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
        field: "added_at",
    },
}, {
    sequelize: database_1.default,
    tableName: "wishlists",
    timestamps: false,
    indexes: [
        { unique: true, fields: ["user_id", "game_id"] },
        { fields: ["user_id"] },
    ],
});
Wishlist.belongsTo(Users_1.default, { foreignKey: "user_id", as: "user" });
Wishlist.belongsTo(Games_1.default, { foreignKey: "game_id", as: "game" });
exports.default = Wishlist;
