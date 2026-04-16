import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { authMiddleware } from "../../src/middlewares/auth.middleware";

jest.mock("../../src/utils/jwt", () => ({
  verifyToken: jest.fn(),
}));

jest.mock("../../src/models/Users", () => ({
  __esModule: true,
  default: {
    findByPk: jest.fn(),
  },
}));

import { verifyToken } from "../../src/utils/jwt";
import Users from "../../src/models/Users";

const verifyTokenMock = verifyToken as unknown as ReturnType<typeof jest.fn>;
const usersMock = Users as unknown as { findByPk: ReturnType<typeof jest.fn> };

function makeResponse() {
  const response = {
    statusCode: 200,
    body: null as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };

  return response;
}

describe("autenticação", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("bloqueia sem token", async () => {
    const req = { headers: {} };
    const res = makeResponse();
    const next = jest.fn();

    await authMiddleware(req as never, res as never, next as never);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ code: "UNAUTHORIZED", message: "Token not provided" });
    expect(next).not.toHaveBeenCalled();
  });

  it("bloqueia header malformado", async () => {
    const req = { headers: { authorization: "Token abc" } };
    const res = makeResponse();
    const next = jest.fn();

    await authMiddleware(req as never, res as never, next as never);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ code: "UNAUTHORIZED", message: "Token not provided" });
    expect(next).not.toHaveBeenCalled();
  });

  it("bloqueia token inválido", async () => {
    const req = { headers: { authorization: "Bearer token-invalido" } };
    const res = makeResponse();
    const next = jest.fn();

    verifyTokenMock.mockImplementation(() => {
      throw new Error("token inválido");
    });

    await authMiddleware(req as never, res as never, next as never);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ code: "UNAUTHORIZED", message: "Invalid or expired token" });
    expect(next).not.toHaveBeenCalled();
  });

  it("libera quando tudo está certo", async () => {
    const req = { headers: { authorization: "Bearer token-valido" } };
    const res = makeResponse();
    const next = jest.fn();

    verifyTokenMock.mockReturnValue({ id: 7, email: "user@email.com" });
    usersMock.findByPk.mockResolvedValue({ get: jest.fn(() => false) });

    await authMiddleware(req as never, res as never, next as never);

    expect(next).toHaveBeenCalledTimes(1);
    expect((req as { user?: unknown }).user).toEqual({ id: 7, email: "user@email.com", isAdmin: false });
  });
});
