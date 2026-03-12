import Categories from "../models/Category";
import Games from "../models/Games";
import { AppError } from "../utils/app-error";
import { CreateCategoryInput, ListCategoriesQuery, UpdateCategoryInput } from "../validators/category.validator";

async function findCategoryOrFail(id: number): Promise<Categories> {
  const category = await Categories.findByPk(id);
  if (!category) {
    throw new AppError(404, "CATEGORY_NOT_FOUND", "Category not found");
  }
  return category;
}

async function checkDuplicateName(name: string, excludeId?: number): Promise<void> {
  const existing = await Categories.findOne({ where: { name } });

  if (existing && existing.id !== excludeId) {
    throw new AppError(409, "CATEGORY_ALREADY_EXISTS", "Category name is already in use");
  }
}

export async function listCategories(query: ListCategoriesQuery) {
  const offset = (query.page - 1) * query.limit;

  const result = await Categories.findAndCountAll({
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

export async function getCategoryById(id: number) {
  const category = await Categories.findByPk(id, {
    include: [{ model: Games, as: "games", through: { attributes: [] } }],
  });

  if (!category) {
    throw new AppError(404, "CATEGORY_NOT_FOUND", "Category not found");
  }

  return category;
}

export async function createCategory(input: CreateCategoryInput) {
  await checkDuplicateName(input.name);
  return Categories.create({ ...input });
}

export async function updateCategory(id: number, input: UpdateCategoryInput) {
  const category = await findCategoryOrFail(id);
  await checkDuplicateName(input.name, id);
  await category.update(input);
  return category;
}

export async function deleteCategory(id: number) {
  const category = await findCategoryOrFail(id);
  await category.destroy();
}
