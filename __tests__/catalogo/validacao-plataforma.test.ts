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

  it("rejeita create com name ou slug acima do limite", () => {
    expect(() =>
      validateCreatePlatformInput({ name: "a".repeat(101), slug: "ps5" }),
    ).toThrow("name must have at most 100 characters");

    expect(() =>
      validateCreatePlatformInput({ name: "PlayStation 5", slug: "a".repeat(101) }),
    ).toThrow("slug must have at most 100 characters");
  });

  it("aceita update parcial", () => {
    expect(validateUpdatePlatformInput({ isActive: true })).toEqual({ isActive: true });
    expect(validateUpdatePlatformInput({ iconUrl: "" })).toEqual({ iconUrl: null });
  });

  it("rejeita update vazio", () => {
    expect(() => validateUpdatePlatformInput({})).toThrow("At least one field must be provided");
  });

  it("rejeita update com name ou slug acima do limite", () => {
    expect(() => validateUpdatePlatformInput({ name: "a".repeat(101) })).toThrow(
      "name must have at most 100 characters",
    );
    expect(() => validateUpdatePlatformInput({ slug: "a".repeat(101) })).toThrow(
      "slug must have at most 100 characters",
    );
  });

  it("rejeita isActive inválido", () => {
    expect(() => validateUpdatePlatformInput({ isActive: "true" as never })).toThrow("isActive must be a boolean");
  });

  it("aceita paginação informada", () => {
    expect(validateListPlatformsQuery({ page: 1, limit: 30 })).toEqual({ page: 1, limit: 30 });
  });

  it("normaliza paginação inválida para padrão", () => {
    expect(validateListPlatformsQuery({ page: -9, limit: 999 })).toEqual({ page: 1, limit: 20 });
  });

  it("aceita id positivo", () => {
    expect(validateIdParam("12")).toBe(12);
  });

  it("rejeita id inválido", () => {
    expect(() => validateIdParam("0")).toThrow(AppError);
  });
});
