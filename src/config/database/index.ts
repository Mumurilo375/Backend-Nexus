import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
    "nexus",
    "postgres",
    "246810",
    {
        host: "localhost",
        port: 5434,//no pc do izaac vai ser 5432, no meu é 5434
        dialect: "postgres",
        logging: console.log,
    }
);

export default sequelize;