import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class UserLibrary extends Model {
    public id!: number;
    public userId!: number;
    public gameId!: number;
    public orderId!: number;
    public purchasedAt!: Date;
}

UserLibrary.init(
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
        orderId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "order_id",
        },
        purchasedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: "purchased_at",
        },
    },
    {
        sequelize,
        tableName: "user_library",
        timestamps: false,
        indexes: [
            { unique: true, fields: ["user_id", "game_id"] },
            { fields: ["user_id"] },
        ],
    }
);

export default UserLibrary;
