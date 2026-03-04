import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class Order extends Model {
    public id!: number;
    public orderNumber!: string;
    public userId!: number;
    public status!: string;
    public subtotal!: number;
    public discountAmount!: number;
    public totalAmount!: number;
    public paymentMethod!: string;
    public createdAt!: Date;
    public updatedAt!: Date;
}

Order.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
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
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: "created_at",
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: "updated_at",
        },
    },
    {
        sequelize,
        tableName: "orders",
        timestamps: true,
        indexes: [
            { fields: ["order_number"] },
            { fields: ["user_id"] },
            { fields: ["status"] },
            { fields: ["created_at"] },
        ],
    }
);

export default Order;
