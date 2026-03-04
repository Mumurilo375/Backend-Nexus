import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class Promotion extends Model {
    public id!: number;
    public name!: string;
    public description?: string;
    public discountPercentage!: number;
    public startDate!: Date;
    public endDate!: Date;
    public isActive!: boolean;
    public createdAt!: Date;
}

Promotion.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        discountPercentage: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "discount_percentage",
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: false,
            field: "start_date",
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: false,
            field: "end_date",
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            field: "is_active",
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: "created_at",
        },
    },
    {
        sequelize,
        tableName: "promotions",
        timestamps: false,
        indexes: [
            { fields: ["is_active"] },
            { fields: ["start_date"] },
            { fields: ["end_date"] },
        ],
    }
);

export default Promotion;
