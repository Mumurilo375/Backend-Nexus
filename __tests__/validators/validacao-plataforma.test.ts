import { describe, expect, it } from "@jest/globals";
import { AppError } from "../../src/utils/app-error";
import {
  validateCreatePlatformInput,
  validateIdParam,
  validateListPlatformsQuery,
  validateUpdatePlatformInput,
} from "../../src/validators/platform.validator";

describe("plataforma", () => {
  it("aceita create", () => {
    expect(
      validateCreatePlatformInput({
        name: "PlayStation 5",
        slug: "ps5",
        iconUrl: "https://site.com/ps5.png",
      }),
    ).toEqual({
      name: "PlayStation 5",
      slug: "ps5",
      iconUrl: "https://site.com/ps5.png",
    });
  });

  it("rejeita create sem campos", () => {
    expect(() => validateCreatePlatformInput({ name: "", slug: "" })).toThrow(AppError);
  });

  it("aceita update parcial", () => {
    expect(validateUpdatePlatformInput({ isActive: true })).toEqual({ isActive: true });
    expect(validateUpdatePlatformInput({ iconUrl: "" })).toEqual({ iconUrl: null });
  });

  it("rejeita update vazio", () => {
    expect(() => validateUpdatePlatformInput({})).toThrow("At least one field must be provided");
  });

  it("rejeita isActive inválido", () => {
    expect(() => validateUpdatePlatformInput({ isActive: "true" as never })).toThrow("isActive must be a boolean");
  });

  it("valida paginação e id", () => {
    expect(validateListPlatformsQuery({ page: 1, limit: 30 })).toEqual({ page: 1, limit: 30 });
    expect(validateIdParam("12")).toBe(12);
  });
});
