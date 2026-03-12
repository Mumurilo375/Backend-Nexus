import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class Promotion extends Model {
    public id!: number;
    public name!: string;
    public description!: string | null;
    public discountPercentage!: number;
    public startDate!: Date;
    public endDate!: Date;
    public isActive!: boolean;
    public createdAt!: Date;
    public updatedAt!: Date;
}

Promotion.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
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
        tableName: "promotions",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        indexes: [
            { fields: ["is_active"] },
            { fields: ["start_date"] },
            { fields: ["end_date"] },
        ],
    }
);

export default Promotion;

