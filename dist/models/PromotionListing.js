"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const GamePlatformListing_1 = __importDefault(require("./GamePlatformListing"));
const Promotion_1 = __importDefault(require("./Promotion"));
class PromotionListing extends sequelize_1.Model {
    id;
    promotionId;
    listingId;
}
PromotionListing.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    promotionId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        field: "promotion_id",
    },
    listingId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        field: "listing_id",
    },
}, {
    sequelize: database_1.default,
    tableName: "promotion_listings",
    timestamps: false,
    indexes: [
        { unique: true, fields: ["promotion_id", "listing_id"] },
        { fields: ["promotion_id"] },
        { fields: ["listing_id"] },
    ],
});
PromotionListing.belongsTo(Promotion_1.default, { foreignKey: "promotion_id", as: "promotion" });
PromotionListing.belongsTo(GamePlatformListing_1.default, { foreignKey: "listing_id", as: "listing" });
exports.default = PromotionListing;
