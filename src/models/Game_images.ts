import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class GameImages extends Model {
    declare id: number;
    declare gameId: number;
    declare imageUrl: string;
    declare sortOrder: number;
    declare createdAt: Date;
    declare updatedAt: Date;
}

GameImages.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        gameId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "game_id",
        },
        imageUrl: {
            type: DataTypes.STRING(500),
            allowNull: false,
            field: "image_url",
        },
        sortOrder: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: "sort_order",
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: "game_images",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        indexes: [
            { fields: ["game_id"] },
            { fields: ["sort_order"] },
        ],
    }
);

export default GameImages;

