import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class OrderItem extends Model {
    public id!: number;
    public orderId!: number;
    public gameId!: number;
    public price!: number;
    public createdAt!: Date;
    public updatedAt!: Date;
}

OrderItem.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        orderId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "order_id",
        },
        gameId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "game_id",
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: "created_at",
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: "updated_at",
        },
    },
    {
        sequelize,
        tableName: "order_items",
        timestamps: true,
        indexes: [
            { fields: ["order_id"] },
            { fields: ["game_id"] },
        ],
    }
);

export default OrderItem;
