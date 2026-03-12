import dotenv from "dotenv";
import { Sequelize } from "sequelize";

dotenv.config();

const database = process.env.DB_NAME ?? "nexus";
const username = process.env.DB_USER ?? "postgres";
const password = process.env.DB_PASSWORD ?? "246810";
const host = process.env.DB_HOST ?? "localhost";
const port = Number(process.env.DB_PORT ?? 5434);
const loggingEnabled = process.env.DB_LOGGING === "true";

const sequelize = new Sequelize(database, username, password, {
  host,
  port,
  dialect: "postgres",
  logging: loggingEnabled ? console.log : false,
  define: {
    underscored: true,
  },
});

export default sequelize;