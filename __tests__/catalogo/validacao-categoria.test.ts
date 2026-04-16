import { describe, expect, it } from "@jest/globals";
import { AppError } from "../../src/utils/app-error";
import {
  validateCreateCategoryInput,
  validateIdParam,
  validateListCategoriesQuery,
  validateUpdateCategoryInput,
} from "../../src/validators/category.validator";

describe("categoria", () => {
  it("aceita nome", () => {
    expect(validateCreateCategoryInput({ name: "Aventura" })).toEqual({ name: "Aventura" });
    expect(validateUpdateCategoryInput({ name: "Ação" })).toEqual({ name: "Ação" });
  });

  it("remove espaços nas pontas do nome", () => {
    expect(validateCreateCategoryInput({ name: "  Aventura  " })).toEqual({ name: "Aventura" });
    expect(validateUpdateCategoryInput({ name: "  Ação  " })).toEqual({ name: "Ação" });
  });

  it("rejeita nome vazio", () => {
    expect(() => validateCreateCategoryInput({ name: "   " })).toThrow(AppError);
    expect(() => validateCreateCategoryInput({ name: "   " })).toThrow("name is required");
  });

  it("rejeita nome grande demais", () => {
    expect(() => validateCreateCategoryInput({ name: "a".repeat(101) })).toThrow(
      "name must have at most 100 characters",
    );
  });

  it("aceita paginação informada", () => {
    expect(validateListCategoriesQuery({ page: 2, limit: 5 })).toEqual({ page: 2, limit: 5 });
  });

  it("normaliza paginação inválida para padrão", () => {
    expect(validateListCategoriesQuery({ page: -5, limit: 500 })).toEqual({ page: 1, limit: 20 });
  });

  it("aceita id positivo", () => {
    expect(validateIdParam("3")).toBe(3);
  });

  it("rejeita id inválido", () => {
    expect(() => validateIdParam("-1")).toThrow(AppError);
  });
});
