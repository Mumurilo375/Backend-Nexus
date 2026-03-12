"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const sequelize_1 = require("sequelize");
dotenv_1.default.config();
const database = process.env.DB_NAME ?? "nexus";
const username = process.env.DB_USER ?? "postgres";
const password = process.env.DB_PASSWORD ?? "postgres";
const host = process.env.DB_HOST ?? "localhost";
const port = Number(process.env.DB_PORT ?? 5432);
const loggingEnabled = process.env.DB_LOGGING === "true";
const sequelize = new sequelize_1.Sequelize(database, username, password, {
    host,
    port,
    dialect: "postgres",
    logging: loggingEnabled ? console.log : false,
});
exports.default = sequelize;
