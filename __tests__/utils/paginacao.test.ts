import { describe, expect, it } from "@jest/globals";
import { buildPaginationMeta, getPaginationOffset } from "../../src/utils/pagination";

describe("paginação", () => {
  it("calcula offset", () => {
    expect(getPaginationOffset(1, 20)).toBe(0);
    expect(getPaginationOffset(2, 20)).toBe(20);
    expect(getPaginationOffset(3, 10)).toBe(20);
  });

  it("monta meta", () => {
    expect(buildPaginationMeta({ page: 2, limit: 10 }, 35)).toEqual({
      page: 2,
      limit: 10,
      total: 35,
      totalPages: 4,
    });
  });
});
