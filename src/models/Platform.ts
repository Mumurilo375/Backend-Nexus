import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class Platform extends Model {
    declare id: number;
    declare name: string;
    declare slug: string;
    declare iconUrl: string | null;
    declare isActive: boolean;
    declare createdAt: Date;
}

Platform.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        slug: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        iconUrl: {
            type: DataTypes.STRING(500),
            allowNull: true,
            field: "icon_url",
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
    },
    {
        sequelize,
        tableName: "platforms",
        timestamps: false,
        indexes: [
            { fields: ["name"] },
            { fields: ["slug"] },
            { fields: ["is_active"] },
        ],
    }
);

export default Platform;

