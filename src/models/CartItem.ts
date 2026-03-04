import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class CartItem extends Model {
    public id!: number;
    public userId!: number;
    public gameId!: number;
    public addedAt!: Date;
}

CartItem.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "user_id",
        },
        gameId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "game_id",
        },
        addedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: "added_at",
        },
    },
    {
        sequelize,
        tableName: "cart_items",
        timestamps: false,
        indexes: [
            { unique: true, fields: ["user_id", "game_id"] },
            { fields: ["user_id"] },
        ],
    }
);

export default CartItem;
