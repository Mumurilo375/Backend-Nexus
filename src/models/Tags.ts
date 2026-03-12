import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class Tags extends Model {
    declare id: number;
    declare name: string;
}

Tags.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
    },
    {
        sequelize,
        tableName: "tags",
        timestamps: false,
        indexes: [
            { fields: ["name"] },
        ],
    }
);

export default Tags;
