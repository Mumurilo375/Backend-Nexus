"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const Games_1 = __importDefault(require("./Games"));
const GameCategory_1 = __importDefault(require("./GameCategory"));
class Categories extends sequelize_1.Model {
    id;
    name;
}
Categories.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
}, {
    sequelize: database_1.default,
    tableName: "categories",
    timestamps: false,
    indexes: [
        { fields: ["name"] },
    ],
});
Categories.belongsToMany(Games_1.default, { through: "GameCategory", foreignKey: "category_id", as: "games" });
Categories.hasMany(GameCategory_1.default, { foreignKey: "category_id", as: "gameCategories" }); // para acessar os registros da tabela de junção diretamente, se necessário
exports.default = Categories;
