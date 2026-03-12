import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class GameTag extends Model {
    public gameId!: number;
    public tagId!: number;
}

GameTag.init(
    {
        gameId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "game_id",
            primaryKey: true,
        },
        tagId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "tag_id",
            primaryKey: true,
        },
    },
    {
        sequelize,
        tableName: "game_tags",
        timestamps: false,
        indexes: [
            { fields: ["game_id"] },
            { fields: ["tag_id"] },
        ],
    }
);

export default GameTag;
