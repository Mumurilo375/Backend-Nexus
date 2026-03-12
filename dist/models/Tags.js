"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const Games_1 = __importDefault(require("./Games"));
const GameTag_1 = __importDefault(require("./GameTag"));
class Tags extends sequelize_1.Model {
    id;
    name;
}
Tags.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
}, {
    sequelize: database_1.default,
    tableName: "tags",
    timestamps: false,
    indexes: [
        { fields: ["name"] },
    ],
});
Tags.belongsToMany(Games_1.default, { through: "GameTag", foreignKey: "tag_id", as: "games" });
Tags.hasMany(GameTag_1.default, { foreignKey: "tag_id", as: "gameTags" });
exports.default = Tags;
