"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const database_1 = __importDefault(require("./config/database"));
const port = Number(process.env.PORT ?? 3000);
const shouldSync = process.env.DB_SYNC === "true";
async function bootstrap() {
    try {
        await database_1.default.authenticate();
        if (shouldSync) {
            await database_1.default.sync({ alter: true });
            console.log("Database sync completed");
        }
        app_1.default.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}
void bootstrap();
