import { Op } from "sequelize";
import GameImages from "../models/Game_images";
import Games from "../models/Games";
import { ensureManagedLegacyMedia } from "../utils/media-storage";

function getLegacyTargetPath(value: string) {
  const normalizedPath = value.replace(/^\/+/, "");
  return `legacy/catalog/${normalizedPath}`;
}

async function migrateGameCovers() {
  const games = await Games.findAll({
    where: {
      coverImageUrl: {
        [Op.like]: "/games/%",
      },
    },
  });

  for (const game of games) {
    const currentUrl = String(game.coverImageUrl ?? "").trim();
    const migratedUrl = await ensureManagedLegacyMedia(
      currentUrl,
      getLegacyTargetPath(currentUrl),
    );

    if (migratedUrl && migratedUrl !== currentUrl) {
      await game.update({ coverImageUrl: migratedUrl });
    }
  }
}

async function migrateGameGallery() {
  const images = await GameImages.findAll({
    where: {
      imageUrl: {
        [Op.like]: "/games/%",
      },
    },
  });

  for (const image of images) {
    const currentUrl = String(image.imageUrl ?? "").trim();
    const migratedUrl = await ensureManagedLegacyMedia(
      currentUrl,
      getLegacyTargetPath(currentUrl),
    );

    if (migratedUrl && migratedUrl !== currentUrl) {
      await image.update({ imageUrl: migratedUrl });
    }
  }
}

export async function migrateLegacyGameMedia() {
  await Promise.all([migrateGameCovers(), migrateGameGallery()]);
}
