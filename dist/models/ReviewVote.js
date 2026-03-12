"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const Review_1 = __importDefault(require("./Review"));
const Users_1 = __importDefault(require("./Users"));
class ReviewVote extends sequelize_1.Model {
    id;
    reviewId;
    userId;
    createdAt;
}
ReviewVote.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    reviewId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        field: "review_id",
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        field: "user_id",
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
        field: "created_at",
    },
}, {
    sequelize: database_1.default,
    tableName: "review_votes",
    timestamps: false,
    indexes: [
        { unique: true, fields: ["review_id", "user_id"] },
        { fields: ["review_id"] },
        { fields: ["user_id"] },
    ],
});
ReviewVote.belongsTo(Review_1.default, { foreignKey: "review_id", as: "review" });
ReviewVote.belongsTo(Users_1.default, { foreignKey: "user_id", as: "user" });
exports.default = ReviewVote;
