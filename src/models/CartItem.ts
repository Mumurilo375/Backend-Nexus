import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class CartItem extends Model {
    declare id: number;
    declare userId: number;
    declare listingId: number;
    declare addedAt: Date;
}

CartItem.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "user_id",
        },
        listingId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "listing_id",
        },
        addedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: "added_at",
        },
    },
    {
        sequelize,
        tableName: "cart_items",
        timestamps: false,
        indexes: [
            { unique: true, fields: ["user_id", "listing_id"] },
            { fields: ["user_id"] },
        ],
    }
);

export default CartItem;

