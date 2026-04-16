import { Router } from "express";
import PromotionController from "../controllers/promotion.controller";
import { adminMiddleware } from "../middlewares/admin.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { promotionMediaFields } from "../middlewares/promotion-media-upload.middleware";

const promotionsRouter = Router();

promotionsRouter.get("/", PromotionController.list);
promotionsRouter.get("/:id", PromotionController.get);
promotionsRouter.post("/", authMiddleware, adminMiddleware, promotionMediaFields, PromotionController.create);
promotionsRouter.put("/:id", authMiddleware, adminMiddleware, promotionMediaFields, PromotionController.update);
promotionsRouter.delete("/:id", authMiddleware, adminMiddleware, PromotionController.remove);
promotionsRouter.post("/:id/listings/:listingId", authMiddleware, adminMiddleware, PromotionController.addListing);
promotionsRouter.delete("/:id/listings/:listingId", authMiddleware, adminMiddleware, PromotionController.removeListing);

export default promotionsRouter;
