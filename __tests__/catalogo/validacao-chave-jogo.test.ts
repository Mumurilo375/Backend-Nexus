import { describe, expect, it } from "@jest/globals";
import { AppError } from "../../src/utils/app-error";
import {
  validateBulkCreateGameKeysInput,
  validateBulkDeleteGameKeysInput,
  validateCreateGameKeyInput,
  validateGameKeyIdParam,
  validateListGameKeysQuery,
  validateUpdateGameKeyInput,
} from "../../src/validators/game-key.validator";

describe("chave de jogo", () => {
  it("aceita create simples", () => {
    expect(validateCreateGameKeyInput({ listingId: 1, keyValue: "AAAA-BBBB-CCCC" })).toEqual({
      listingId: 1,
      keyValue: "AAAA-BBBB-CCCC",
    });
  });

  it("aceita create em lote", () => {
    expect(validateBulkCreateGameKeysInput({ listingId: 2, keyValues: ["K1", "K2"] })).toEqual({
      listingId: 2,
      keyValues: ["K1", "K2"],
    });
  });

  it("rejeita listas vazias", () => {
    expect(() => validateBulkCreateGameKeysInput({ listingId: 1, keyValues: [] })).toThrow(AppError);
    expect(() => validateBulkDeleteGameKeysInput({ listingId: 1, ids: [] })).toThrow(AppError);
  });

  it("aceita bulk delete", () => {
    expect(validateBulkDeleteGameKeysInput({ listingId: 10, ids: [1, 2, 3] })).toEqual({
      listingId: 10,
      ids: [1, 2, 3],
    });
  });

  it("aceita status válido", () => {
    expect(validateUpdateGameKeyInput({ status: "available" })).toEqual({ status: "available" });
    expect(() => validateUpdateGameKeyInput({ status: "invalid" })).toThrow(
      "status must be available, reserved or sold",
    );
  });

  it("aceita query com paginação e listingId", () => {
    expect(validateListGameKeysQuery({ page: 2, limit: 5, listingId: 9 })).toEqual({
      page: 2,
      limit: 5,
      listingId: 9,
    });
  });

  it("usa paginação padrão quando query está vazia", () => {
    expect(validateListGameKeysQuery({})).toEqual({ page: 1, limit: 20 });
  });

  it("valida id", () => {
    expect(validateGameKeyIdParam("6")).toBe(6);
    expect(() => validateGameKeyIdParam("0")).toThrow(AppError);
  });
});
