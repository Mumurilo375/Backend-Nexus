import express from "express";
import cors from "cors";
import { errorMiddleware, notFoundMiddleware } from "./middlewares/error.middleware";
import routes from "./routes";

const app = express();
const jsonParser = express.json();

app.use(
	cors({
		origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
	})
);
app.use((req, res, next) => {
	if (req.originalUrl === "/payments/stripe/webhook") {
		express.raw({ type: "application/json" })(req, res, next);
		return;
	}

	jsonParser(req, res, next);
});
app.use(routes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;