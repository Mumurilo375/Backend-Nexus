import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class Promotion extends Model {
  declare id: number;
  declare name: string;
  declare description: string | null;
  declare discountPercentage: number;
  declare startDate: Date;
  declare endDate: Date;
  declare isActive: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
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
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "updated_at",
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
  },
);

export default Promotion;
