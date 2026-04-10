import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class ListingPriceChange extends Model {
  declare id: number;
  declare listingId: number;
  declare previousPrice: number | null;
  declare nextPrice: number;
  declare changedByUserId: number | null;
  declare createdAt: Date;
}

ListingPriceChange.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    listingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "listing_id",
    },
    previousPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: "previous_price",
    },
    nextPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: "next_price",
    },
    changedByUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "changed_by_user_id",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
  },
  {
    sequelize,
    tableName: "listing_price_changes",
    timestamps: false,
    indexes: [
      { fields: ["listing_id"] },
      { fields: ["changed_by_user_id"] },
      { fields: ["created_at"] },
    ],
  },
);

export default ListingPriceChange;
