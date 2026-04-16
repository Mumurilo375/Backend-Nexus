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

const entradaUsuarioValido = {
  email: "user@email.com",
  username: "user1",
  password: "SenhaForte123!",
  fullName: "Usuário Teste",
  cpf: "51603871888",
  avatarUrl: null,
};

function criarUsuarioPersistido(overrides = {}) {
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

  describe("listagem", () => {
    it("retorna itens e metadados quando existem usuários", async () => {
      usersMock.findAndCountAll.mockResolvedValue({ rows: [{ id: 1 }, { id: 2 }], count: 22 });

      const resultado = await listUsers({ page: 2, limit: 10 });

      expect(resultado).toEqual({
        items: [{ id: 1 }, { id: 2 }],
        meta: { page: 2, limit: 10, total: 22, totalPages: 3 },
      });
    });

    it("retorna lista vazia e totalPages igual a zero", async () => {
      usersMock.findAndCountAll.mockResolvedValue({ rows: [], count: 0 });

      const resultado = await listUsers({ page: 1, limit: 10 });

      expect(resultado).toEqual({
        items: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
      });
    });
  });

  describe("busca por id", () => {
    it("retorna usuário quando existe", async () => {
      const usuarioExistente = { id: 7, email: "ok@email.com" };
      usersMock.findByPk.mockResolvedValue(usuarioExistente);

      await expect(getUserById(7)).resolves.toEqual(usuarioExistente);
    });

    it("retorna erro quando usuário não existe", async () => {
      usersMock.findByPk.mockResolvedValue(null);

      await expect(getUserById(999)).rejects.toThrow(AppError);
      await expect(getUserById(999)).rejects.toThrow("User not found");
    });
  });

  describe("cadastro", () => {
    it("cria usuário quando não há duplicidade", async () => {
      usersMock.findOne.mockResolvedValue(null);
      usersMock.create.mockResolvedValue(criarUsuarioPersistido());

      const resultado = await createUser(entradaUsuarioValido);

      expect(resultado).toEqual({ id: 10, email: "user@email.com", username: "user1" });
    });

    it("bloqueia email duplicado", async () => {
      usersMock.findOne.mockResolvedValue({ email: "user@email.com", username: "outro", cpf: "111" });

      await expect(
        createUser({ ...entradaUsuarioValido, username: "novo" }),
      ).rejects.toThrow("Email is already in use");
    });

    it("bloqueia username duplicado", async () => {
      usersMock.findOne.mockResolvedValue({ email: "x@x.com", username: "novo", cpf: "111" });

      await expect(
        createUser({ ...entradaUsuarioValido, email: "novo@email.com", username: "novo" }),
      ).rejects.toThrow("Username is already in use");
    });

    it("bloqueia CPF duplicado", async () => {
      usersMock.findOne.mockResolvedValue({ email: "x@x.com", username: "outro", cpf: "51603871888" });

      await expect(
        createUser({ ...entradaUsuarioValido, email: "novo@email.com", username: "novo" }),
      ).rejects.toThrow("CPF is already in use");
    });
  });

  describe("autorização", () => {
    it("bloqueia edição de outra conta", async () => {
      await expect(
        updateUser(5, 99, { username: "novo", fullName: "Nome", cpf: "51603871888" }, undefined),
      ).rejects.toThrow("You can only manage your own account");
    });

    it("bloqueia exclusão de outra conta", async () => {
      await expect(deleteUser(3, 4)).rejects.toThrow("You can only manage your own account");
    });
  });
});
