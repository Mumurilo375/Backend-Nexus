import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class GameKey extends Model {
    declare id: number;
    declare listingId: number;
    declare keyValue: string;
    declare status: string;
    declare reservedAt: Date | null;
    declare soldAt: Date | null;
    declare createdAt: Date;
}

GameKey.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        listingId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "listing_id",
        },
        keyValue: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: "key_value",
        },
        status: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: "available",
        },
        reservedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: "reserved_at",
        },
        soldAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: "sold_at",
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: "created_at",
        },
    },
    {
        sequelize,
        tableName: "game_keys",
        timestamps: false,
        indexes: [
            { fields: ["listing_id"] },
            { fields: ["status"] },
            { unique: true, fields: ["key_value"] },
            { fields: ["listing_id", "status"] },
        ],
    }
);

export default GameKey;

