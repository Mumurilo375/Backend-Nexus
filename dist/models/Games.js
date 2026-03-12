"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const Game_images_1 = __importDefault(require("./Game_images"));
const Review_1 = __importDefault(require("./Review"));
const Wishlist_1 = __importDefault(require("./Wishlist"));
const GamePlatformListing_1 = __importDefault(require("./GamePlatformListing"));
const Category_1 = __importDefault(require("./Category"));
const Tags_1 = __importDefault(require("./Tags"));
class Games extends sequelize_1.Model {
    id;
    title;
    description;
    longDescription;
    releaseDate;
    coverImageUrl;
    isActive;
    createdAt;
    updatedAt;
}
Games.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    longDescription: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        field: "long_description",
    },
    releaseDate: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
        field: "release_date",
    },
    coverImageUrl: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: false,
        field: "cover_image_url",
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
    tableName: "games",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
        { fields: ["title"] },
        { fields: ["release_date"] },
        { fields: ["is_active"] },
    ],
});
Games.hasMany(Game_images_1.default, { foreignKey: "game_id", as: "images" });
Games.hasMany(Review_1.default, { foreignKey: "game_id", as: "reviews" });
Games.hasMany(Wishlist_1.default, { foreignKey: "game_id", as: "wishlists" });
Games.hasMany(GamePlatformListing_1.default, { foreignKey: "game_id", as: "platformListings" });
Games.belongsToMany(Category_1.default, { through: "GameCategory", foreignKey: "game_id", as: "categories" });
Games.belongsToMany(Tags_1.default, { through: "GameTag", foreignKey: "game_id", as: "tags" });
exports.default = Games;
