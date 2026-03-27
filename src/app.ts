import cors, { CorsOptions } from "cors";
import express from "express";
import { errorMiddleware, notFoundMiddleware } from "./middlewares/error.middleware";
import routes from "./routes";

const app = express();

function getAllowedOrigins(): string[] {
  return (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const allowedOrigins = getAllowedOrigins();

const corsOptions: CorsOptions = {
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Origin not allowed by CORS"));
  },
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(routes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
