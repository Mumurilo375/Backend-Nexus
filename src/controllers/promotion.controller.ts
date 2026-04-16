import { NextFunction, Request, Response } from "express";
import {
  createPromotion,
  deletePromotion,
  getPromotionById,
  linkListingToPromotion,
  listPromotions,
  unlinkListingFromPromotion,
  updatePromotion,
} from "../services/promotion.service";
import { UploadedPromotionMediaFiles } from "../middlewares/promotion-media-upload.middleware";
import { deleteTemporaryUploads } from "../utils/media-storage";
import {
  validateCreatePromotionInput,
  validateListPromotionsQuery,
  validatePromotionIdParam,
  validateUpdatePromotionInput,
} from "../validators/promotion.validator";
import { validateListingIdParam } from "../validators/listing.validator";

function readUploadedPromotionMediaFiles(files: Request["files"]) {
  const uploadedFiles = (files as UploadedPromotionMediaFiles | undefined) ?? {};

  return {
    coverFile: uploadedFiles.coverFile?.[0] ?? null,
    bannerFile: uploadedFiles.bannerFile?.[0] ?? null,
  };
}

async function cleanupUploadedPromotionMedia(files: Request["files"]) {
  const uploadedFiles = readUploadedPromotionMediaFiles(files);
  await deleteTemporaryUploads([uploadedFiles.coverFile, uploadedFiles.bannerFile]);
}

class PromotionController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = validateListPromotionsQuery(req.query);
      const promotions = await listPromotions(query);
      res.status(200).json(promotions);
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const promotionId = validatePromotionIdParam(req.params.id as string);
      const promotion = await getPromotionById(promotionId);
      res.status(200).json(promotion);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = validateCreatePromotionInput(req.body);
      const promotion = await createPromotion(input, readUploadedPromotionMediaFiles(req.files));
      await cleanupUploadedPromotionMedia(req.files);
      res.status(201).json(promotion);
    } catch (error) {
      await cleanupUploadedPromotionMedia(req.files);
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const promotionId = validatePromotionIdParam(req.params.id as string);
      const input = validateUpdatePromotionInput(req.body);
      const promotion = await updatePromotion(
        promotionId,
        input,
        readUploadedPromotionMediaFiles(req.files),
      );
      await cleanupUploadedPromotionMedia(req.files);
      res.status(200).json(promotion);
    } catch (error) {
      await cleanupUploadedPromotionMedia(req.files);
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const promotionId = validatePromotionIdParam(req.params.id as string);
      await deletePromotion(promotionId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  static async addListing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const promotionId = validatePromotionIdParam(req.params.id as string);
      const listingId = validateListingIdParam(req.params.listingId as string);
      const link = await linkListingToPromotion(promotionId, listingId);
      res.status(201).json(link);
    } catch (error) {
      next(error);
    }
  }

  static async removeListing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const promotionId = validatePromotionIdParam(req.params.id as string);
      const listingId = validateListingIdParam(req.params.listingId as string);
      await unlinkListingFromPromotion(promotionId, listingId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default PromotionController;
