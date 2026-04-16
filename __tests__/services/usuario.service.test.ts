import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { AppError } from "../../src/utils/app-error";
import {
  createUser,
  deleteUser,
  getUserById,
  listUsers,
  updateUser,
} from "../../src/services/user.service";

jest.mock("../../src/models/Users", () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    findAndCountAll: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock("../../src/utils/password", () => ({
  hashPassword: jest.fn(() => "HASHED_PASSWORD"),
}));

jest.mock("../../src/utils/media-storage", () => ({
  deleteManagedMedia: jest.fn(),
  isManagedMediaUrl: jest.fn(() => true),
  moveUploadedUserAvatar: jest.fn(),
}));

import Users from "../../src/models/Users";

type MockFn = ReturnType<typeof jest.fn>;

const usersMock = Users as unknown as {
  findOne: MockFn;
  findByPk: MockFn;
  findAndCountAll: MockFn;
  create: MockFn;
};

function makeStoredUser(overrides = {}) {
  return {
    id: 10,
    avatarUrl: null,
    update: jest.fn(),
    destroy: jest.fn(),
    toJSON: () => ({
      id: 10,
      email: "user@email.com",
      username: "user1",
      passwordHash: "HASHED_PASSWORD",
    }),
    ...overrides,
  };
}

describe("usuário", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("lista com paginação", async () => {
    usersMock.findAndCountAll.mockResolvedValue({ rows: [{ id: 1 }, { id: 2 }], count: 22 });

    expect(await listUsers({ page: 2, limit: 10 })).toEqual({
      items: [{ id: 1 }, { id: 2 }],
      meta: { page: 2, limit: 10, total: 22, totalPages: 3 },
    });
  });

  it("retorna 404 se não existir", async () => {
    usersMock.findByPk.mockResolvedValue(null);

    await expect(getUserById(999)).rejects.toThrow(AppError);
    await expect(getUserById(999)).rejects.toThrow("User not found");
  });

  it("cria usuário", async () => {
    usersMock.findOne.mockResolvedValue(null);
    usersMock.create.mockResolvedValue(makeStoredUser());

    expect(
      await createUser({
        email: "user@email.com",
        username: "user1",
        password: "SenhaForte123!",
        fullName: "Usuário Teste",
        cpf: "51603871888",
        avatarUrl: null,
      }),
    ).toEqual({ id: 10, email: "user@email.com", username: "user1" });
  });

  it("bloqueia email duplicado", async () => {
    usersMock.findOne.mockResolvedValue({ email: "user@email.com", username: "outro", cpf: "111" });

    await expect(
      createUser({ email: "user@email.com", username: "novo", password: "SenhaForte123!", fullName: "Nome", cpf: "51603871888", avatarUrl: null }),
    ).rejects.toThrow("Email is already in use");
  });

  it("bloqueia edição de outra conta", async () => {
    await expect(
      updateUser(5, 99, { username: "novo", fullName: "Nome", cpf: "51603871888" }, undefined),
    ).rejects.toThrow("You can only manage your own account");
  });

  it("bloqueia exclusão de outra conta", async () => {
    await expect(deleteUser(3, 4)).rejects.toThrow("You can only manage your own account");
  });
});
