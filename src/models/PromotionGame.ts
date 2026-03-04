import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class PromotionGame extends Model {
    public id!: number;
    public promotionId!: number;
    public gameId!: number;
}

PromotionGame.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        promotionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "promotion_id",
        },
        gameId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "game_id",
        },
    },
    {
        sequelize,
        tableName: "promotion_games",
        timestamps: false,
        indexes: [
            { unique: true, fields: ["promotion_id", "game_id"] },
            { fields: ["promotion_id"] },
            { fields: ["game_id"] },
        ],
    }
);

export default PromotionGame;
