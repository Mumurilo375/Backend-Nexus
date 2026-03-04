import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class Games extends Model {
    public id!: number;
    public title!: string; //notNull
    public description!: string; //notNull
    public longDescription!: string; //notNull
    public releaseDate!: Date; //notNull
    public basePrice!: number; //notNull //default 0
    public coverImageUrl?: string; //notNull
    public isActive!: boolean; //default true
    public createdAt!: Date; //default now
    public updatedAt!: Date; //default now
}

Games.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        longDescription: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        releaseDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        basePrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0
        },
        coverImageUrl: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        }
    },
    {
        sequelize,
        tableName: "games",
        timestamps: true
    },
);

export default Games;