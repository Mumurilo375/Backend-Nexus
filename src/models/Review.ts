import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class Review extends Model {
    declare id: number;
    declare gameId: number;
    declare userId: number;
    declare rating: number;
    declare comment: string;
    declare createdAt: Date;
    declare updatedAt: Date;
}

Review.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        gameId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "game_id",
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "user_id",
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: "reviews",
        timestamps: false,
        indexes: [
            { unique: true, fields: ["game_id", "user_id"] },
            { fields: ["game_id"] },
            { fields: ["user_id"] },
            { fields: ["rating"] },
            { fields: ["created_at"] },
        ],
    }
);

export default Review;
