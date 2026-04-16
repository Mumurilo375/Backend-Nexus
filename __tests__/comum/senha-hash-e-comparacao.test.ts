import { describe, expect, it } from "@jest/globals";
import { comparePassword, hashPassword } from "../../src/utils/password";

describe("senha", () => {
  it("gera hash no formato algoritmo:salt:hash", () => {
    const senha = "SenhaForte123!";
    const resultadoHash = hashPassword(senha);
    const partesDoHash = resultadoHash.split(":");

    const algoritmo = partesDoHash[0];
    const salt = partesDoHash[1];
    const hash = partesDoHash[2];

    expect(partesDoHash).toHaveLength(3);
    expect(algoritmo).toBe("scrypt");
    expect(salt.length).toBeGreaterThan(0);
    expect(hash.length).toBeGreaterThan(0);
  });

  it("retorna true para senha correta", () => {
    const senha = "SenhaForte123!";
    const resultadoHash = hashPassword(senha);

    expect(comparePassword(senha, resultadoHash)).toBe(true);
  });

  it("retorna false para senha errada", () => {
    const resultadoHash = hashPassword("SenhaForte123!");

    expect(comparePassword("OutraSenha999@", resultadoHash)).toBe(false);
  });

  it("retorna false para hash inválido", () => {
    expect(comparePassword("123", "")).toBe(false);
    expect(comparePassword("123", "qualquer-coisa")).toBe(false);
  });
});
