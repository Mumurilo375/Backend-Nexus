import { mkdirSync } from "fs";
import multer from "multer";
import path from "path";
import { AppError } from "../utils/app-error";
import { getTemporaryUploadRoot } from "../utils/media-storage";

const temporaryUploadRoot = getTemporaryUploadRoot();

mkdirSync(temporaryUploadRoot, { recursive: true });

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, temporaryUploadRoot),
  filename: (_req, file, callback) =>
    callback(
      null,
      `${Date.now()}-${Math.random().toString(16).slice(2, 10)}${path.extname(file.originalname) || ".bin"}`,
    ),
});

function avatarImageOnlyFilter(
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

const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter: avatarImageOnlyFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
});

export const userAvatarUpload = avatarUpload.single("avatarFile");
