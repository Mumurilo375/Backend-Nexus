import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class GamePlatformListing extends Model {
    public id!: number;
    public gameId!: number;
    public platformId!: number;
    public price!: number;
    public isActive!: boolean;
    public createdAt!: Date;
    public updatedAt!: Date;
}

GamePlatformListing.init(
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
        platformId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "platform_id",
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            field: "is_active",
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
        tableName: "game_platform_listings",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        indexes: [
            { unique: true, fields: ["game_id", "platform_id"] },
            { fields: ["game_id"] },
            { fields: ["platform_id"] },
            { fields: ["is_active"] },
        ],
    }
);

export default GamePlatformListing;

