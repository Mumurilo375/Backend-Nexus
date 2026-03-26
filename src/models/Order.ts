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
    declare paymentProvider: string | null;
    declare providerCheckoutSessionId: string | null;
    declare providerPaymentIntentId: string | null;
    declare paymentStatus: string;
    declare paymentErrorCode: string | null;
    declare paymentErrorMessage: string | null;
    declare cardBrand: string | null;
    declare cardLast4: string | null;
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
        paymentProvider: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: "payment_provider",
        },
        providerCheckoutSessionId: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: "provider_checkout_session_id",
        },
        providerPaymentIntentId: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: "provider_payment_intent_id",
        },
        paymentStatus: {
            type: DataTypes.STRING(30),
            allowNull: false,
            defaultValue: "pending",
            field: "payment_status",
        },
        paymentErrorCode: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: "payment_error_code",
        },
        paymentErrorMessage: {
            type: DataTypes.STRING(500),
            allowNull: true,
            field: "payment_error_message",
        },
        cardBrand: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: "card_brand",
        },
        cardLast4: {
            type: DataTypes.STRING(4),
            allowNull: true,
            field: "card_last4",
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
    }
);

export default Order;

