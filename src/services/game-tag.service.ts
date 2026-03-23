import GameTag from "../models/GameTag";
import Games from "../models/Games";
import Tags from "../models/Tags";
import { AppError } from "../utils/app-error";
import { buildPaginationMeta, getPaginationOffset } from "../utils/pagination";
import { CreateGameTagInput, ListGameTagsQuery } from "../validators/game-tag.validator";

export async function listGameTags(query: ListGameTagsQuery) {
  const offset = getPaginationOffset(query.page, query.limit);

  const where = query.gameId ? { gameId: query.gameId } : undefined;

  const result = await GameTag.findAndCountAll({
    where,
    limit: query.limit,
    offset,
    order: [["gameId", "DESC"], ["tagId", "DESC"]],
    include: [
      { model: Games, as: "game" },
      { model: Tags, as: "tag" },
    ],
  });

  return {
    items: result.rows,
    meta: buildPaginationMeta(query, result.count),
  };
}

export async function createGameTag(input: CreateGameTagInput) {
  const game = await Games.findByPk(input.gameId);
  if (!game) {
    throw new AppError(404, "GAME_NOT_FOUND", "Game not found");
  }

  const tag = await Tags.findByPk(input.tagId);
  if (!tag) {
    throw new AppError(404, "TAG_NOT_FOUND", "Tag not found");
  }

  const [item] = await GameTag.findOrCreate({
    where: { gameId: input.gameId, tagId: input.tagId },
    defaults: { gameId: input.gameId, tagId: input.tagId },
  });

  return item;
}

export async function deleteGameTag(gameId: number, tagId: number) {
  await GameTag.destroy({ where: { gameId, tagId } });
}
