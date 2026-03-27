require('dotenv').config();

const connectionUrl = process.env.DATABASE_URL || process.env.DB_URL;
const useSsl =
  process.env.DB_SSL === 'true' ||
  (process.env.NODE_ENV === 'production' && Boolean(connectionUrl));

function createConfig() {
  if (connectionUrl) {
    return {
      use_env_variable: process.env.DATABASE_URL ? 'DATABASE_URL' : 'DB_URL',
      dialect: 'postgres',
      dialectOptions: useSsl
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          }
        : undefined,
    };
  }

  return {
    username: process.env.PGUSER || process.env.DB_USER || 'postgres',
    password: process.env.PGPASSWORD || process.env.DB_PASSWORD || 'postgres',
    database: process.env.PGDATABASE || process.env.DB_NAME || 'nexus',
    host: process.env.PGHOST || process.env.DB_HOST || 'localhost',
    port: Number(process.env.PGPORT || process.env.DB_PORT || 5432),
    dialect: 'postgres',
    dialectOptions: useSsl
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : undefined,
  };
}

module.exports = {
  development: createConfig(),
  production: createConfig(),
};
