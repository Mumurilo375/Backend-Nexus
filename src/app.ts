import express from "express";
import { errorMiddleware, notFoundMiddleware } from "./middlewares/error.middleware";
import routes from "./routes";

const app = express();

app.use(express.json());
app.use(routes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;