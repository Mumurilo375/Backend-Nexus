import { Op } from "sequelize";
import Platform from "../models/Platform";
import GamePlatformListing from "../models/GamePlatformListing";
import Games from "../models/Games";
import { AppError } from "../utils/app-error";
import { CreatePlatformInput, ListPlatformsQuery, UpdatePlatformInput } from "../validators/platform.validator";

async function findPlatformOrFail(id: number): Promise<Platform> {
  const platform = await Platform.findByPk(id);
  if (!platform) {
    throw new AppError(404, "PLATFORM_NOT_FOUND", "Platform not found");
  }
  return platform;
}

async function checkDuplicate(input: { name?: string; slug?: string }, excludeId?: number): Promise<void> {
  const conditions = [];
  if (input.name) conditions.push({ name: input.name });
  if (input.slug) conditions.push({ slug: input.slug });
  if (conditions.length === 0) return;

  const where: Record<string, unknown> = { [Op.or]: conditions };
  if (excludeId) where.id = { [Op.ne]: excludeId };

  const existing = await Platform.findOne({ where });

  if (!existing) return;

  if (input.name && existing.name === input.name) {
    throw new AppError(409, "PLATFORM_ALREADY_EXISTS", "Platform name is already in use");
  }
  throw new AppError(409, "PLATFORM_ALREADY_EXISTS", "Platform slug is already in use");
}

export async function listPlatforms(query: ListPlatformsQuery) {
  const offset = (query.page - 1) * query.limit;

  const result = await Platform.findAndCountAll({
    limit: query.limit,
    offset,
    order: [["name", "ASC"]],
  });

  return {
    items: result.rows,
    meta: {
      page: query.page,
      limit: query.limit,
      total: result.count,
      totalPages: Math.ceil(result.count / query.limit),
    },
  };
}

export async function getPlatformById(id: number) {
  const platform = await Platform.findByPk(id, {
    include: [{
      model: GamePlatformListing,
      as: "gameListings",
      include: [{ model: Games, as: "game" }],
    }],
  });

  if (!platform) {
    throw new AppError(404, "PLATFORM_NOT_FOUND", "Platform not found");
  }

  return platform;
}

export async function createPlatform(input: CreatePlatformInput) {
  await checkDuplicate(input);
  return Platform.create({ ...input });
}

export async function updatePlatform(id: number, input: UpdatePlatformInput) {
  const platform = await findPlatformOrFail(id);
  await checkDuplicate(input, id);
  await platform.update(input);
  return platform;
}

export async function deletePlatform(id: number) {
  const platform = await findPlatformOrFail(id);
  await platform.destroy();
}
