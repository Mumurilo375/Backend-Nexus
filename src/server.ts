if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
import app from "./app";
import sequelize from "./config/database";
import "./models/associations";
import { migrateLegacyGameMedia } from "./services/legacy-game-media.service";
import { ensureMediaStorage } from "./utils/media-storage";

const port = Number(process.env.PORT ?? 3000);

async function bootstrap(): Promise<void> {
  try {
    await sequelize.authenticate();
    await ensureMediaStorage();
    await migrateLegacyGameMedia();

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

void bootstrap();
