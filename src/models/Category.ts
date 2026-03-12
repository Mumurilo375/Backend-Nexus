import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class Categories extends Model {
    public id!: number;
    public name!: string;
}

Categories.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
    },
    {
        sequelize,
        tableName: "categories",
        timestamps: false,
        indexes: [
            { fields: ["name"] },
        ],
    }
);

export default Categories;
