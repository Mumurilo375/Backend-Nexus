import { Router } from "express";
import ListingController from "../controllers/listing.controller";
import { adminMiddleware } from "../middlewares/admin.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";

const listingsRouter = Router();

listingsRouter.get("/", ListingController.list);
listingsRouter.get("/:id/stock", ListingController.stock);
listingsRouter.get("/:id/details", ListingController.details);
listingsRouter.get("/:id", ListingController.get);
listingsRouter.post("/", authMiddleware, adminMiddleware, ListingController.create);
listingsRouter.put("/:id", authMiddleware, adminMiddleware, ListingController.update);
listingsRouter.delete("/:id", authMiddleware, adminMiddleware, ListingController.remove);

export default listingsRouter;
