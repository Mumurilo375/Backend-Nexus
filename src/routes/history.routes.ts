import { Router } from "express";
import HistoryController from "../controllers/history.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const historyRouter = Router();

historyRouter.get("/purchases", authMiddleware, HistoryController.list);

export default historyRouter;
