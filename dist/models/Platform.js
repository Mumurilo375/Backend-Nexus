"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const GamePlatformListing_1 = __importDefault(require("./GamePlatformListing"));
class Platform extends sequelize_1.Model {
    id;
    name;
    slug;
    iconUrl;
    isActive;
    createdAt;
}
Platform.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    slug: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    iconUrl: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: true,
        field: "icon_url",
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
}, {
    sequelize: database_1.default,
    tableName: "platforms",
    timestamps: false,
    indexes: [
        { fields: ["name"] },
        { fields: ["slug"] },
        { fields: ["is_active"] },
    ],
});
Platform.hasMany(GamePlatformListing_1.default, { foreignKey: "platform_id", as: "gameListings" });
exports.default = Platform;
