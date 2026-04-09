import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class Order extends Model {
  declare id: number;
  declare orderNumber: string;
  declare userId: number;
  declare status: string;
  declare subtotal: number;
  declare discountAmount: number;
  declare totalAmount: number;
  declare paymentMethod: string;
  declare paymentStatus: string;
  declare paymentConfirmedAt: Date | null;
  declare cancelledAt: Date | null;
  declare createdAt: Date;
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    orderNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: "order_number",
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id",
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "pending",
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: "discount_amount",
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: "total_amount",
    },
    paymentMethod: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: "payment_method",
    },
    paymentStatus: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "pending",
      field: "payment_status",
    },
    paymentConfirmedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "payment_confirmed_at",
    },
    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "cancelled_at",
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
    tableName: "orders",
    timestamps: false,
    indexes: [
      { fields: ["order_number"] },
      { fields: ["user_id"] },
      { fields: ["status"] },
      { fields: ["created_at"] },
    ],
  },
);

export default Order;
