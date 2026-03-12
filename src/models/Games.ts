import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class Games extends Model {
    declare id: number;
    declare title: string;
    declare description: string;
    declare longDescription: string;
    declare releaseDate: Date;
    declare coverImageUrl: string;
    declare isActive: boolean;
    declare createdAt: Date;
    declare updatedAt: Date;
}

Games.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        longDescription: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: "long_description",
        },
        releaseDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            field: "release_date",
        },
        coverImageUrl: {
            type: DataTypes.STRING(500),
            allowNull: false,
            field: "cover_image_url",
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
        tableName: "games",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        indexes: [
            { fields: ["title"] },
            { fields: ["release_date"] },
            { fields: ["is_active"] },
        ],
    }
);

export default Games;

