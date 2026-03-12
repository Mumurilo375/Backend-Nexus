import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class Users extends Model {
    declare id: number;
    declare email: string;
    declare username: string;
    declare fullName: string | null;
    declare cpf: string | null;
    declare avatarUrl: string | null;
    declare isAdmin: boolean;
    declare createdAt: Date;
    declare updatedAt: Date;
    declare passwordHash: string;
}

Users.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        username: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        passwordHash: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: "password_hash",
        },
        fullName: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: "full_name",
        },
        cpf: {
            type: DataTypes.STRING(14),
            allowNull: true,
            unique: true,
        },
        avatarUrl: {
            type: DataTypes.STRING(500),
            allowNull: true,
            field: "avatar_url",
        },
        isAdmin: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: "is_admin",
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
        tableName: "users",
        timestamps: true,
        indexes: [
            { fields: ["email"] },
            { fields: ["username"] },
            { fields: ["cpf"] },
        ],
    }
);

export default Users;

