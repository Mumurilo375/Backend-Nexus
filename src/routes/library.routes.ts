import { Router } from "express";
import LibraryController from "../controllers/library.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const libraryRouter = Router();

libraryRouter.get("/keys", authMiddleware, LibraryController.list);

export default libraryRouter;
