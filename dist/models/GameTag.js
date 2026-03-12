"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const Tags_1 = __importDefault(require("./Tags"));
const Games_1 = __importDefault(require("./Games"));
class GameTag extends sequelize_1.Model {
    gameId;
    tagId;
}
GameTag.init({
    gameId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        field: "game_id",
        primaryKey: true,
    },
    tagId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        field: "tag_id",
        primaryKey: true,
    },
}, {
    sequelize: database_1.default,
    tableName: "game_tags",
    timestamps: false,
    indexes: [
        { fields: ["game_id"] },
        { fields: ["tag_id"] },
    ],
});
GameTag.belongsTo(Games_1.default, { foreignKey: "game_id", as: "game" });
GameTag.belongsTo(Tags_1.default, { foreignKey: "tag_id", as: "tag" });
exports.default = GameTag;
