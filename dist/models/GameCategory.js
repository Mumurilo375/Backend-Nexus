"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const Games_1 = __importDefault(require("./Games"));
const Category_1 = __importDefault(require("./Category"));
class GameCategory extends sequelize_1.Model {
    gameId;
    categoryId;
}
GameCategory.init({
    gameId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        field: "game_id",
        primaryKey: true,
    },
    categoryId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        field: "category_id",
        primaryKey: true,
    },
}, {
    sequelize: database_1.default,
    tableName: "game_categories",
    timestamps: false,
    indexes: [
        { fields: ["game_id"] },
        { fields: ["category_id"] },
    ],
});
GameCategory.belongsTo(Games_1.default, { foreignKey: "game_id", as: "game" });
GameCategory.belongsTo(Category_1.default, { foreignKey: "category_id", as: "category" });
exports.default = GameCategory;
