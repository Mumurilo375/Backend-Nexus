import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class DeliveredKey extends Model {
    declare id: number;
    declare userId: number;
    declare orderItemId: number;
    declare gameKeyId: number;
    declare deliveredAt: Date;
}

DeliveredKey.init(
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
        orderItemId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            field: "order_item_id",
        },
        gameKeyId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            field: "game_key_id",
        },
        deliveredAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: "delivered_at",
        },
    },
    {
        sequelize,
        tableName: "delivered_keys",
        timestamps: false,
        indexes: [
            { fields: ["user_id"] },
            { fields: ["order_item_id"] },
            { fields: ["game_key_id"] },
        ],
    }
);

export default DeliveredKey;

