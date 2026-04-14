import { Transaction } from "sequelize";
import GameImages from "../models/Game_images";
import Games from "../models/Games";
import { AppError } from "../utils/app-error";
import { isManagedMediaUrl, moveUploadedGameImage } from "../utils/media-storage";
import { PlainValue } from "../utils/value-types";
import {
  GameGalleryItemInput,
  UpdateGameInput,
} from "../validators/game.validator";

export type UploadedGameMedia = {
  coverFile?: Express.Multer.File | null;
  galleryFiles?: Express.Multer.File[];
};

type GalleryRow = {
  imageUrl: string;
  sortOrder: number;
};

function asTrimmedString(value: PlainValue): string {
  return String(value ?? "").trim();
}

export function buildGameUpdateFields(
  input: UpdateGameInput,
  coverImageUrl: string,
): Partial<
  Record<
    "coverImageUrl" | "title" | "description" | "longDescription" | "releaseDate",
    string
  > &
    Record<"isActive", boolean>
> {
  const fields: Partial<
    Record<
      "coverImageUrl" | "title" | "description" | "longDescription" | "releaseDate",
      string
    > &
      Record<"isActive", boolean>
  > = { coverImageUrl };

  if (input.title !== undefined) fields.title = input.title;
  if (input.description !== undefined) fields.description = input.description;
  if (input.longDescription !== undefined) fields.longDescription = input.longDescription;
  if (input.releaseDate !== undefined) fields.releaseDate = input.releaseDate;
  if (input.isActive !== undefined) fields.isActive = input.isActive;

  return fields;
}

export function getManagedGameMediaUrls(game: Games, images: GameImages[]): string[] {
  return [asTrimmedString(game.coverImageUrl), ...images.map((image) => image.imageUrl)].filter(
    (url) => isManagedMediaUrl(url),
  );
}

export async function saveCoverImage(options: {
  gameId: number;
  currentUrl?: string | null;
  nextUrl?: string | null;
  coverFile?: Express.Multer.File | null;
  createdMediaUrls: string[];
}) {
  if (options.coverFile) {
    const uploadedCoverUrl = await moveUploadedGameImage(options.coverFile, {
      gameId: options.gameId,
      kind: "cover",
    });

    options.createdMediaUrls.push(uploadedCoverUrl);
    return uploadedCoverUrl;
  }

  return asTrimmedString(options.nextUrl ?? options.currentUrl);
}

export function buildGalleryItems(
  galleryItems: GameGalleryItemInput[] | undefined,
  galleryFiles: Express.Multer.File[],
) {
  if (galleryItems !== undefined) return galleryItems;
  if (galleryFiles.length === 0) return undefined;

  return galleryFiles.map((_, fileIndex) => ({ kind: "file" as const, fileIndex }));
}

export async function buildGalleryRows(options: {
  gameId: number;
  galleryItems: GameGalleryItemInput[];
  galleryFiles: Express.Multer.File[];
  existingImages: GameImages[];
  createdMediaUrls: string[];
}) {
  const existingImageById = new Map(
    options.existingImages.map((image) => [image.id, image] as const),
  );
  const keptImageIds = new Set<number>();
  const rows: GalleryRow[] = [];

  for (const item of options.galleryItems) {
    if (item.kind === "existing") {
      const existingImage = existingImageById.get(item.id ?? 0);

      if (!existingImage) {
        throw new AppError(400, "VALIDATION_ERROR", "Gallery item no longer exists");
      }

      keptImageIds.add(existingImage.id);
      rows.push({ imageUrl: existingImage.imageUrl, sortOrder: rows.length });
      continue;
    }

    if (item.kind === "file") {
      const galleryFile = options.galleryFiles[item.fileIndex ?? -1];

      if (!galleryFile) {
        throw new AppError(400, "VALIDATION_ERROR", "Gallery file is missing");
      }

      const uploadedGalleryUrl = await moveUploadedGameImage(galleryFile, {
        gameId: options.gameId,
        kind: "gallery",
      });

      options.createdMediaUrls.push(uploadedGalleryUrl);
      rows.push({ imageUrl: uploadedGalleryUrl, sortOrder: rows.length });
      continue;
    }

    rows.push({
      imageUrl: asTrimmedString(item.url),
      sortOrder: rows.length,
    });
  }

  return { rows, keptImageIds };
}

export async function saveGameImages(
  gameId: number,
  rows: GalleryRow[],
  transaction: Transaction,
) {
  if (rows.length === 0) {
    return;
  }

  await GameImages.bulkCreate(
    rows.map((row) => ({
      gameId,
      imageUrl: row.imageUrl,
      sortOrder: row.sortOrder,
    })),
    { transaction },
  );
}

export async function replaceGameImages(
  gameId: number,
  rows: GalleryRow[],
  transaction: Transaction,
) {
  await GameImages.destroy({ where: { gameId }, transaction });
  await saveGameImages(gameId, rows, transaction);
}
