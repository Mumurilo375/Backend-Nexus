import { describe, expect, it } from "@jest/globals";
import { AppError } from "../../src/utils/app-error";
import { validateLoginInput } from "../../src/validators/auth.validator";

describe("login", () => {
  it("normaliza email e aceita senha", () => {
    expect(validateLoginInput({ email: "  USER@Email.com ", password: "123" })).toEqual({
      email: "user@email.com",
      password: "123",
    });
  });

  it("rejeita email inválido", () => {
    expect(() => validateLoginInput({ email: "email-invalido", password: "123" })).toThrow(AppError);
    expect(() => validateLoginInput({ email: "email-invalido", password: "123" })).toThrow("Invalid email format");
  });

  it("rejeita senha vazia", () => {
    expect(() => validateLoginInput({ email: "a@a.com", password: "" })).toThrow(AppError);
    expect(() => validateLoginInput({ email: "a@a.com", password: "" })).toThrow("Password is required");
  });
});
