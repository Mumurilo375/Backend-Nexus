import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { AppError } from "../../src/utils/app-error";
import { loginUser } from "../../src/services/auth.service";

jest.mock("../../src/models/Users", () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
  },
}));

jest.mock("../../src/utils/password", () => ({
  comparePassword: jest.fn(),
}));

jest.mock("../../src/utils/jwt", () => ({
  generateToken: jest.fn(),
}));

import Users from "../../src/models/Users";
import { comparePassword } from "../../src/utils/password";
import { generateToken } from "../../src/utils/jwt";

type MockFn = ReturnType<typeof jest.fn>;

const usersMock = Users as unknown as { findOne: MockFn };
const comparePasswordMock = comparePassword as unknown as MockFn;
const generateTokenMock = generateToken as unknown as MockFn;

function makeUser(overrides = {}) {
  return {
    id: 1,
    email: "user@email.com",
    passwordHash: "HASH",
    toJSON: () => ({
      id: 1,
      email: "user@email.com",
      username: "user1",
      passwordHash: "HASH",
    }),
    ...overrides,
  };
}

async function expectLoginFailure(email: string, password: string) {
  await expect(loginUser({ email, password })).rejects.toThrow("Invalid email or password");
}

describe("login do usuário", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retorna token e usuário", async () => {
    usersMock.findOne.mockResolvedValue(makeUser());
    comparePasswordMock.mockReturnValue(true);
    generateTokenMock.mockReturnValue("token-fake");

    expect(await loginUser({ email: "user@email.com", password: "SenhaForte123!" })).toEqual({
      user: { id: 1, email: "user@email.com", username: "user1" },
      token: "token-fake",
    });
  });

  it("rejeita usuário inexistente", async () => {
    usersMock.findOne.mockResolvedValue(null);

    await expect(loginUser({ email: "x@x.com", password: "123" })).rejects.toThrow(AppError);
    await expectLoginFailure("x@x.com", "123");
  });

  it("rejeita senha errada", async () => {
    usersMock.findOne.mockResolvedValue(makeUser({ toJSON: () => ({ id: 1, email: "user@email.com", passwordHash: "HASH" }) }));
    comparePasswordMock.mockReturnValue(false);

    await expectLoginFailure("user@email.com", "errada");
  });
});
