import { beforeEach, describe, expect, it } from "@jest/globals";
import { AppError } from "../../src/utils/app-error";
import { generateToken, verifyToken } from "../../src/utils/jwt";

describe("token JWT", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret";
  });

  it("gera e valida token", () => {
    const token = generateToken({ id: 1, email: "user@email.com" });
    const payload = verifyToken(token);

    expect(payload).toEqual({ id: 1, email: "user@email.com", iat: expect.any(Number), exp: expect.any(Number) });
  });

  it("rejeita sem JWT_SECRET", () => {
    delete process.env.JWT_SECRET;

    expect(() => generateToken({ id: 1, email: "user@email.com" })).toThrow(AppError);
    expect(() => verifyToken("qualquer-token")).toThrow(AppError);
  });
});
