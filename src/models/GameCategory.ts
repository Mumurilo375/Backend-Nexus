import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class GameCategory extends Model {
    declare gameId: number;
    declare categoryId: number;
}

GameCategory.init(
    {
        gameId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "game_id",
            primaryKey: true,
        },
        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "category_id",
            primaryKey: true,
        },
    },
    {
        sequelize,
        tableName: "game_categories",
        timestamps: false,
        indexes: [
            { fields: ["game_id"] },
            { fields: ["category_id"] },
        ],
    }
);

export default GameCategory;
