import { describe, expect, it } from "@jest/globals";
import { buildPaginationMeta, getPaginationOffset } from "../../src/utils/pagination";

describe("paginação", () => {
  describe("getPaginationOffset", () => {
    it("retorna 0 quando está na primeira página", () => {
      expect(getPaginationOffset(1, 20)).toBe(0);
    });

    it("retorna 20 quando está na segunda página com limite 20", () => {
      expect(getPaginationOffset(2, 20)).toBe(20);
    });

    it("retorna 20 quando está na terceira página com limite 10", () => {
      expect(getPaginationOffset(3, 10)).toBe(20);
    });
  });

  describe("buildPaginationMeta", () => {
    it("monta metadados quando há registros", () => {
      const paginacao = { page: 2, limit: 10 };
      const totalDeRegistros = 35;

      expect(buildPaginationMeta(paginacao, totalDeRegistros)).toEqual({
        page: 2,
        limit: 10,
        total: 35,
        totalPages: 4,
      });
    });

    it("retorna totalPages 0 quando total é zero", () => {
      const paginacao = { page: 1, limit: 10 };
      const totalDeRegistros = 0;

      expect(buildPaginationMeta(paginacao, totalDeRegistros)).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
    });
  });
});
