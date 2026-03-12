import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class PromotionListing extends Model {
    declare id: number;
    declare promotionId: number;
    declare listingId: number;
}

PromotionListing.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        promotionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "promotion_id",
        },
        listingId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "listing_id",
        },
    },
    {
        sequelize,
        tableName: "promotion_listings",
        timestamps: false,
        indexes: [
            { unique: true, fields: ["promotion_id", "listing_id"] },
            { fields: ["promotion_id"] },
            { fields: ["listing_id"] },
        ],
    }
);

export default PromotionListing;

