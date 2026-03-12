import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class OrderItem extends Model {
    declare id: number;
    declare orderId: number;
    declare listingId: number;
    declare gameKeyId: number | null;
    declare price: number;
    declare createdAt: Date;
}

OrderItem.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        orderId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "order_id",
        },
        listingId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "listing_id",
        },
        gameKeyId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: "game_key_id",
            unique: true,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: "order_items",
        timestamps: false,
        indexes: [
            { fields: ["order_id"] },
            { fields: ["listing_id"] },
            { fields: ["game_key_id"] },
        ],
    }
);

export default OrderItem;

