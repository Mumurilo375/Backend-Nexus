import dotenv from "dotenv";
import { Sequelize } from "sequelize";

dotenv.config();

const loggingEnabled = process.env.DB_LOGGING === "true";
const databaseUrl =
  process.env.DATABASE_URL ??
  process.env.DB_URL;

function shouldUseSsl(): boolean {
  if (process.env.DB_SSL === "true") {
    return true;
  }

  if (process.env.NODE_ENV === "production" && databaseUrl) {
    return true;
  }

  return false;
}

const sequelizeOptions = {
  dialect: "postgres" as const,
  logging: loggingEnabled ? console.log : false,
  define: {
    underscored: true,
  },
  dialectOptions: shouldUseSsl()
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : undefined,
};

const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, sequelizeOptions)
  : new Sequelize(
      process.env.PGDATABASE ?? process.env.DB_NAME ?? "nexus",
      process.env.PGUSER ?? process.env.DB_USER ?? "postgres",
      process.env.PGPASSWORD ?? process.env.DB_PASSWORD ?? "postgres",
      {
        ...sequelizeOptions,
        host: process.env.PGHOST ?? process.env.DB_HOST ?? "localhost",
        port: Number(process.env.PGPORT ?? process.env.DB_PORT ?? 5432),
      },
    );

export default sequelize;
