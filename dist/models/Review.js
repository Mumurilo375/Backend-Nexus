"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const ReviewVote_1 = __importDefault(require("./ReviewVote"));
const Users_1 = __importDefault(require("./Users"));
const Games_1 = __importDefault(require("./Games"));
class Review extends sequelize_1.Model {
    id;
    gameId;
    userId;
    rating;
    comment;
    createdAt;
    updatedAt;
}
Review.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    gameId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        field: "game_id",
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        field: "user_id",
    },
    rating: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    comment: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
        field: "created_at",
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
        field: "updated_at",
    },
}, {
    sequelize: database_1.default,
    tableName: "reviews",
    timestamps: false,
    indexes: [
        { unique: true, fields: ["game_id", "user_id"] },
        { fields: ["game_id"] },
        { fields: ["user_id"] },
        { fields: ["rating"] },
        { fields: ["created_at"] },
    ],
});
Review.belongsTo(Games_1.default, { foreignKey: "game_id", as: "game" });
Review.belongsTo(Users_1.default, { foreignKey: "user_id", as: "user" });
Review.hasMany(ReviewVote_1.default, { foreignKey: "review_id", as: "votes" });
exports.default = Review;
