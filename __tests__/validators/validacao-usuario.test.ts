import { describe, expect, it } from "@jest/globals";
import { AppError } from "../../src/utils/app-error";
import {
  validateCreateUserInput,
  validateIdParam,
  validateListUsersQuery,
  validateUpdateUserInput,
} from "../../src/validators/user.validator";

describe("usuário", () => {
  describe("cadastro", () => {
    it("aceita e normaliza email e CPF", () => {
      expect(
        validateCreateUserInput({
          email: " USER@Email.com ",
          username: "usuario123",
          password: "SenhaForte123!",
          fullName: "Usuário Teste",
          cpf: "516.038.718-88",
        }),
      ).toEqual({
        email: "user@email.com",
        username: "usuario123",
        password: "SenhaForte123!",
        fullName: "Usuário Teste",
        cpf: "51603871888",
        avatarUrl: null,
      });
    });

    it("rejeita campo obrigatório vazio", () => {
      expect(() =>
        validateCreateUserInput({
          email: "a@a.com",
          username: "",
          password: "SenhaForte123!",
          fullName: "Nome",
          cpf: "51603871888",
        }),
      ).toThrow(AppError);
    });

    it("rejeita CPF inválido", () => {
      expect(() =>
        validateCreateUserInput({
          email: "a@a.com",
          username: "usuario123",
          password: "SenhaForte123!",
          fullName: "Nome",
          cpf: "11111111111",
        }),
      ).toThrow("Invalid CPF");
    });

    it("rejeita senha fraca", () => {
      expect(() =>
        validateCreateUserInput({
          email: "a@a.com",
          username: "usuario123",
          password: "abc",
          fullName: "Nome",
          cpf: "51603871888",
        }),
      ).toThrow("Password must have at least 8 characters");
    });
  });

  describe("edição", () => {
    it("aceita sem senha", () => {
      expect(
        validateUpdateUserInput({
          username: "novo_usuario",
          fullName: "Novo Nome",
          cpf: "516.038.718-88",
        }),
      ).toEqual({
        username: "novo_usuario",
        fullName: "Novo Nome",
        cpf: "51603871888",
      });
    });

    it("bloqueia troca de email", () => {
      expect(() =>
        validateUpdateUserInput({
          email: "novo@email.com",
          username: "u",
          fullName: "Nome",
          cpf: "51603871888",
        }),
      ).toThrow("Email cannot be changed");
    });

    it("rejeita senha em branco", () => {
      expect(() =>
        validateUpdateUserInput({
          username: "usuario123",
          password: "   ",
          fullName: "Nome",
          cpf: "51603871888",
        }),
      ).toThrow("password is required");
    });
  });

  describe("consulta e id", () => {
    it("aceita paginação", () => {
      expect(validateListUsersQuery({ page: 2, limit: 15 })).toEqual({ page: 2, limit: 15 });
      expect(validateListUsersQuery({ page: -5, limit: 200 })).toEqual({ page: 1, limit: 20 });
    });

    it("aceita id positivo", () => {
      expect(validateIdParam("10")).toBe(10);
      expect(() => validateIdParam("0")).toThrow(AppError);
    });
  });
});
