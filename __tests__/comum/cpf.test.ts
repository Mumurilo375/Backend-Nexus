import { describe, expect, it } from "@jest/globals";
import { formatCpf, isValidCpf, normalizeCpf } from "../../src/utils/cpf";

describe("cpf", () => {
  it("normaliza cpf", () => {
    expect(normalizeCpf(" 516.038.718-88 ")).toBe("51603871888");
  });

  it("formata cpf", () => {
    expect(formatCpf("51603871888")).toBe("516.038.718-88");
  });

  it("valida cpf", () => {
    expect(isValidCpf("516.038.718-88")).toBe(true);
    expect(isValidCpf("111.111.111-11")).toBe(false);
  });
});