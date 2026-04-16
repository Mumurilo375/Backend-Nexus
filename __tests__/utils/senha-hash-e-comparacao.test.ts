import { describe, expect, it } from "@jest/globals";
import { comparePassword, hashPassword } from "../../src/utils/password";

describe("senha", () => {
  it("gera hash no formato certo", () => {
    const hashed = hashPassword("SenhaForte123!");

    expect(hashed.startsWith("scrypt:")).toBe(true);
    expect(hashed.split(":")).toHaveLength(3);
  });

  it("confere senha correta", () => {
    const password = "SenhaForte123!";
    const hashed = hashPassword(password);

    expect(comparePassword(password, hashed)).toBe(true);
  });

  it("rejeita senha errada", () => {
    const hashed = hashPassword("SenhaForte123!");

    expect(comparePassword("OutraSenha999@", hashed)).toBe(false);
  });

  it("rejeita hash inválido", () => {
    expect(comparePassword("123", "")).toBe(false);
    expect(comparePassword("123", "qualquer-coisa")).toBe(false);
  });
});
