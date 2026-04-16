import { mkdirSync } from "fs";
import multer from "multer";
import path from "path";
import { AppError } from "../utils/app-error";
import { getTemporaryUploadRoot } from "../utils/media-storage";

const temporaryUploadRoot = getTemporaryUploadRoot();

mkdirSync(temporaryUploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, temporaryUploadRoot),
  filename: (_req, file, callback) =>
    callback(
      null,
      `${Date.now()}-${Math.random().toString(16).slice(2, 10)}${path.extname(file.originalname) || ".bin"}`,
    ),
});

function imageOnlyFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback,
) {
  if (file.mimetype.startsWith("image/")) {
    callback(null, true);
    return;
  }

  callback(new AppError(400, "VALIDATION_ERROR", "Only image files are allowed"));
}

export const promotionMediaUpload = multer({
  storage,
  fileFilter: imageOnlyFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 2,
  },
});

export const promotionMediaFields = promotionMediaUpload.fields([
  { name: "coverFile", maxCount: 1 },
  { name: "bannerFile", maxCount: 1 },
]);

export type UploadedPromotionMediaFiles = {
  coverFile?: Express.Multer.File[];
  bannerFile?: Express.Multer.File[];
};
