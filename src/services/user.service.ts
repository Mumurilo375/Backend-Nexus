import { Op } from "sequelize";
import User from "../models/Users";
import { AppError } from "../utils/app-error";
import { hashPassword } from "../utils/password";
import { CreateUserInput, ListUsersQuery } from "../validators/user.validator";

export async function listUsers(query: ListUsersQuery) {
  const pular = (query.page - 1) * query.limit;

  const resultado = await User.findAndCountAll({
    attributes: { exclude: ["passwordHash"] },
    limit: query.limit,
    offset: pular,
    order: [["createdAt", "DESC"]],
  });

  return {
    items: resultado.rows,
    meta: {
      page: query.page,
      limit: query.limit,
      total: resultado.count,
      totalPages: Math.ceil(resultado.count / query.limit),
    },
  };
}

export async function getUserById(id: number) {
  const user = await User.findByPk(id, {
    attributes: { exclude: ["passwordHash"] },
  });

  if (!user) {
    throw new AppError(404, "USER_NOT_FOUND", "User not found");
  }

  return user;
}

export async function createUser(input: CreateUserInput) {
  const jaExiste = await User.findOne({
    where: {
      [Op.or]: [{ email: input.email }, { username: input.username }],
    },
  });

  if (jaExiste) {
    throw new AppError(409, "USER_ALREADY_EXISTS", "Email or username is already in use");
  }

  const novoUsuario = await User.create({
    email: input.email,
    username: input.username,
    passwordHash: hashPassword(input.password),
    fullName: input.fullName ?? null,
    cpf: input.cpf ?? null,
    avatarUrl: input.avatarUrl ?? null,
  });

  return novoUsuario;
}
