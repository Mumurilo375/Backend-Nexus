import { Op } from "sequelize";
import Users from "../models/Users";
import { AppError } from "../utils/app-error";
import { hashPassword } from "../utils/password";
import { CreateUserInput, ListUsersQuery, UpdateUserInput } from "../validators/user.validator";

// ── Helpers ─────────────────────────────────────────────────

// Campos sensiveis nao devem sair na resposta da API.
const PUBLIC_USER_ATTRIBUTES = { exclude: ["passwordHash"] };

async function checkDuplicateOnCreate(input: CreateUserInput): Promise<void> {
  const existing = await Users.findOne({
    where: {
      [Op.or]: [
        { email: input.email },
        { username: input.username },
        { cpf: input.cpf },
      ],
    },
  });

  if (!existing) return;

  if (existing.email === input.email) {
    throw new AppError(409, "USER_ALREADY_EXISTS", "Email is already in use");
  }
  if (existing.username === input.username) {
    throw new AppError(409, "USER_ALREADY_EXISTS", "Username is already in use");
  }
  throw new AppError(409, "USER_ALREADY_EXISTS", "CPF is already in use");
}

// Em update, o proprio usuario pode manter seus dados atuais sem conflito.
async function checkDuplicateOnUpdate(userId: number, input: UpdateUserInput): Promise<void> {
  const conditions = [];

  if (input.username) conditions.push({ username: input.username });
  if (input.cpf) conditions.push({ cpf: input.cpf });
  if (conditions.length === 0) return;

  const existing = await Users.findOne({
    where: { id: { [Op.ne]: userId }, [Op.or]: conditions },
  });

  if (!existing) return;

  if (input.username && existing.username === input.username) {
    throw new AppError(409, "USER_ALREADY_EXISTS", "Username is already in use");
  }
  throw new AppError(409, "USER_ALREADY_EXISTS", "CPF is already in use");
}

// Regra de autorizacao: usuario so pode alterar/deletar a propria conta.
function ensureOwner(targetId: number, authId: number): void {
  if (targetId !== authId) {
    throw new AppError(403, "FORBIDDEN", "You can only manage your own account");
  }
}

async function findUserOrFail(id: number): Promise<Users> {
  const user = await Users.findByPk(id);
  if (!user) {
    throw new AppError(404, "USER_NOT_FOUND", "User not found");
  }
  return user;
}

// ── Services ────────────────────────────────────────────────

export async function listUsers(query: ListUsersQuery) {
  const offset = (query.page - 1) * query.limit;

  const result = await Users.findAndCountAll({
    attributes: PUBLIC_USER_ATTRIBUTES,
    limit: query.limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return {
    items: result.rows,
    meta: {
      page: query.page,
      limit: query.limit,
      total: result.count,
      totalPages: Math.ceil(result.count / query.limit),
    },
  };
}

export async function getUserById(id: number) {
  const user = await Users.findByPk(id, { attributes: PUBLIC_USER_ATTRIBUTES });

  if (!user) {
    throw new AppError(404, "USER_NOT_FOUND", "User not found");
  }

  return user;
}

export async function createUser(input: CreateUserInput) {
  await checkDuplicateOnCreate(input);

  const user = await Users.create({
    email: input.email,
    username: input.username,
    passwordHash: hashPassword(input.password),
    fullName: input.fullName,
    cpf: input.cpf,
    avatarUrl: input.avatarUrl ?? null,
  });

  const { passwordHash, ...userData } = user.toJSON();
  return userData;
}

export async function updateUser(targetId: number, authId: number, input: UpdateUserInput) {
  ensureOwner(targetId, authId);
  const user = await findUserOrFail(targetId);

  await checkDuplicateOnUpdate(targetId, input);

  const fields: Record<string, unknown> = { ...input };
  if (input.password) {
    fields.passwordHash = hashPassword(input.password);
    delete fields.password;
  }

  await user.update(fields);

  const { passwordHash, ...userData } = user.toJSON();
  return userData;
}

export async function deleteUser(targetId: number, authId: number) {
  ensureOwner(targetId, authId);
  const user = await findUserOrFail(targetId);
  await user.destroy();
}