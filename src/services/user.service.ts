import { Op } from "sequelize";
import Users from "../models/Users";
import { AppError } from "../utils/app-error";
import { deleteManagedMedia, isManagedMediaUrl, moveUploadedUserAvatar } from "../utils/media-storage";
import { buildPaginationMeta, getPaginationOffset } from "../utils/pagination";
import { hashPassword } from "../utils/password";
import { PlainObject } from "../utils/value-types";
import { CreateUserInput, ListUsersQuery, UpdateUserInput } from "../validators/user.validator";

// ── Helpers ─────────────────────────────────────────────────

// Campos sensíveis não devem sair na resposta da API.
const PUBLIC_USER_ATTRIBUTES = { exclude: ["passwordHash"] };
type UploadedAvatarFile = Express.Multer.File | null | undefined;

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
    throw new AppError(409, "EMAIL_ALREADY_EXISTS", "Email is already in use");
  }
  if (existing.username === input.username) {
    throw new AppError(409, "USERNAME_ALREADY_EXISTS", "Username is already in use");
  }
  throw new AppError(409, "CPF_ALREADY_EXISTS", "CPF is already in use");
}

// Em update, o próprio usuário pode manter seus dados atuais sem conflito.
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
    throw new AppError(409, "USERNAME_ALREADY_EXISTS", "Username is already in use");
  }
  throw new AppError(409, "CPF_ALREADY_EXISTS", "CPF is already in use");
}

// Regra de autorização: usuário só pode alterar/deletar a própria conta.
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
  const result = await Users.findAndCountAll({
    attributes: PUBLIC_USER_ATTRIBUTES,
    limit: query.limit,
    offset: getPaginationOffset(query.page, query.limit),
    order: [["createdAt", "DESC"]],
  });

  return {
    items: result.rows,
    meta: buildPaginationMeta(query, result.count),
  };
}

export async function getUserById(id: number) {
  const user = await Users.findByPk(id, { attributes: PUBLIC_USER_ATTRIBUTES });

  if (!user) {
    throw new AppError(404, "USER_NOT_FOUND", "User not found");
  }

  return user;
}

export async function createUser(
  input: CreateUserInput,
  avatarFile?: UploadedAvatarFile,
) {
  await checkDuplicateOnCreate(input);

  const user = await Users.create({
    email: input.email,
    username: input.username,
    passwordHash: hashPassword(input.password),
    fullName: input.fullName,
    cpf: input.cpf,
    avatarUrl: input.avatarUrl ?? null,
  });

  let createdAvatarUrl: string | null = null;

  try {
    if (avatarFile) {
      createdAvatarUrl = await moveUploadedUserAvatar(avatarFile, {
        userId: user.id,
      });
      await user.update({ avatarUrl: createdAvatarUrl });
    }

    const { passwordHash, ...userData } = user.toJSON();
    return userData;
  } catch (error) {
    if (createdAvatarUrl) {
      await deleteManagedMedia(createdAvatarUrl);
    }

    await user.destroy();
    throw error;
  }
}

export async function updateUser(
  targetId: number,
  authId: number,
  input: UpdateUserInput,
  avatarFile?: UploadedAvatarFile,
) {
  ensureOwner(targetId, authId);
  const user = await findUserOrFail(targetId);

  await checkDuplicateOnUpdate(targetId, input);

  const currentAvatarUrl = String(user.avatarUrl ?? "").trim() || null;
  let createdAvatarUrl: string | null = null;
  let nextAvatarUrl = input.avatarUrl;
  const shouldUpdateAvatar = input.avatarUrl !== undefined || Boolean(avatarFile);

  if (avatarFile) {
    createdAvatarUrl = await moveUploadedUserAvatar(avatarFile, {
      userId: user.id,
    });
    nextAvatarUrl = createdAvatarUrl;
  }

  const fields: PlainObject = { ...input };
  if (input.password) {
    fields.passwordHash = hashPassword(input.password);
    delete fields.password;
  }

  if (shouldUpdateAvatar) {
    fields.avatarUrl = nextAvatarUrl ?? null;
  }

  try {
    await user.update(fields);

    const updatedAvatarUrl = String(user.avatarUrl ?? "").trim() || null;

    if (
      currentAvatarUrl &&
      currentAvatarUrl !== updatedAvatarUrl &&
      isManagedMediaUrl(currentAvatarUrl)
    ) {
      await deleteManagedMedia(currentAvatarUrl);
    }

    const { passwordHash, ...userData } = user.toJSON();
    return userData;
  } catch (error) {
    if (createdAvatarUrl) {
      await deleteManagedMedia(createdAvatarUrl);
    }

    throw error;
  }
}

export async function deleteUser(targetId: number, authId: number) {
  ensureOwner(targetId, authId);
  const user = await findUserOrFail(targetId);
  const avatarUrl = String(user.avatarUrl ?? "").trim() || null;
  await user.destroy();

  if (avatarUrl && isManagedMediaUrl(avatarUrl)) {
    await deleteManagedMedia(avatarUrl);
  }
}
