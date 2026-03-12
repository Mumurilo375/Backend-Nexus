import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class ReviewVote extends Model {
    declare id: number;
    declare reviewId: number;
    declare userId: number;
    declare createdAt: Date;
}

ReviewVote.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        reviewId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "review_id",
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "user_id",
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: "review_votes",
        timestamps: false,
        indexes: [
            { unique: true, fields: ["review_id", "user_id"] },
            { fields: ["review_id"] },
            { fields: ["user_id"] },
        ],
    }
);

export default ReviewVote;

