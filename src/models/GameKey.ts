import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class GameKey extends Model {
    public id!: number;
    public listingId!: number;
    public keyValue!: string;
    public status!: string;
    public reservedAt!: Date | null;
    public soldAt!: Date | null;
    public createdAt!: Date;
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
        },
    },
    {
        sequelize,
        tableName: "game_keys",
        timestamps: false,
        indexes: [
            { fields: ["listing_id"] },
            { fields: ["status"] },
            { fields: ["listing_id", "status"] },
        ],
    }
);

export default GameKey;

