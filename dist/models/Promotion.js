"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const GamePlatformListing_1 = __importDefault(require("./GamePlatformListing"));
const PromotionListing_1 = __importDefault(require("./PromotionListing"));
class Promotion extends sequelize_1.Model {
    id;
    name;
    description;
    discountPercentage;
    startDate;
    endDate;
    isActive;
    createdAt;
    updatedAt;
}
Promotion.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    discountPercentage: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        field: "discount_percentage",
    },
    startDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        field: "start_date",
    },
    endDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        field: "end_date",
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
    tableName: "promotions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
        { fields: ["is_active"] },
        { fields: ["start_date"] },
        { fields: ["end_date"] },
    ],
});
Promotion.belongsToMany(GamePlatformListing_1.default, {
    through: "PromotionListings",
    foreignKey: "promotion_id",
    otherKey: "listing_id",
    as: "listings",
});
Promotion.hasMany(PromotionListing_1.default, { foreignKey: "promotion_id", as: "promotionListings" });
exports.default = Promotion;
