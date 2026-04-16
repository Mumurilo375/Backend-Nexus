import { describe, expect, it } from "@jest/globals";
import { AppError } from "../../src/utils/app-error";
import {
  isInputObject,
  readQueryParams,
  readRequestBody,
  readStrictQueryParams,
  validatePaginationQuery,
  validatePositiveIdParam,
} from "../../src/utils/request-validator";

describe("validação de requisição", () => {
  describe("objeto de entrada", () => {
    it("aceita objeto simples", () => {
      expect(isInputObject({ a: 1 })).toBe(true);
    });

    it("rejeita null, array e string", () => {
      expect(isInputObject(null)).toBe(false);
      expect(isInputObject([1, 2, 3])).toBe(false);
      expect(isInputObject("texto")).toBe(false);
    });
  });

  describe("corpo da requisição", () => {
    it("retorna o objeto recebido", () => {
      const body = { email: "a@a.com" };
      expect(readRequestBody(body)).toEqual(body);
    });

    it("rejeita valor que não seja objeto", () => {
      expect(() => readRequestBody("invalido")).toThrow(AppError);
      expect(() => readRequestBody("invalido")).toThrow("Request body must be an object");
    });
  });

  describe("query", () => {
    it("aceita query inválida como vazia", () => {
      expect(readQueryParams("x" as never)).toEqual({});
      expect(readQueryParams(undefined)).toEqual({});
    });

    it("aceita undefined na versão estrita", () => {
      expect(readStrictQueryParams(undefined)).toEqual({});
    });

    it("rejeita query inválida na versão estrita", () => {
      expect(() => readStrictQueryParams("x" as never)).toThrow(AppError);
      expect(() => readStrictQueryParams("x" as never)).toThrow("Query params must be an object");
    });
  });

  describe("paginação", () => {
    it("aplica os valores padrão", () => {
      expect(validatePaginationQuery({})).toEqual({ page: 1, limit: 20 });
    });

    it("corrige page inválida para 1", () => {
      expect(validatePaginationQuery({ page: -1, limit: 0 })).toEqual({ page: 1, limit: 20 });
    });

    it("corrige limit acima do máximo para 20", () => {
      expect(validatePaginationQuery({ page: 2, limit: 500 })).toEqual({ page: 2, limit: 20 });
    });

    it("mantém valores válidos", () => {
      expect(validatePaginationQuery({ page: 3, limit: 10 })).toEqual({ page: 3, limit: 10 });
    });
  });

  describe("id positivo", () => {
    it("aceita inteiro positivo", () => {
      expect(validatePositiveIdParam("7")).toBe(7);
    });

    it("rejeita zero, negativo e decimal", () => {
      expect(() => validatePositiveIdParam("0")).toThrow(AppError);
      expect(() => validatePositiveIdParam("-2")).toThrow(AppError);
      expect(() => validatePositiveIdParam("1.5")).toThrow(AppError);
      expect(() => validatePositiveIdParam("abc")).toThrow(AppError);
    });
  });
});
