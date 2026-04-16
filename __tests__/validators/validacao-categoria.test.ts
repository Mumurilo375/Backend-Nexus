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

  it("rejeita nome vazio", () => {
    expect(() => validateCreateCategoryInput({ name: "   " })).toThrow(AppError);
    expect(() => validateCreateCategoryInput({ name: "   " })).toThrow("name is required");
  });

  it("rejeita nome grande demais", () => {
    expect(() => validateCreateCategoryInput({ name: "a".repeat(101) })).toThrow(
      "name must have at most 100 characters",
    );
  });

  it("valida paginação e id", () => {
    expect(validateListCategoriesQuery({ page: 2, limit: 5 })).toEqual({ page: 2, limit: 5 });
    
    expect(validateIdParam("3")).toBe(3);
    expect(() => validateIdParam("-1")).toThrow(AppError);
  });
});
