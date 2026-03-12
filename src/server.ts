import "dotenv/config";
import app from "./app";
import sequelize from "./config/database";
import "./models/associations";

const port = Number(process.env.PORT ?? 3000);
const shouldSync = process.env.DB_SYNC === "true";

async function bootstrap(): Promise<void> {
  try {
    await sequelize.authenticate();



    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

void bootstrap();