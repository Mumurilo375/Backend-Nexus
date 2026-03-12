import { AppError } from "../utils/app-error";

export interface CreateUserInput {
  email: string;
  username: string;
  password: string;
  fullName?: string | null;
  cpf?: string | null;
  avatarUrl?: string | null;
}

export interface ListUsersQuery {
  page: number;
  limit: number;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCreateUserInput(body: any): CreateUserInput {
  if (!body || typeof body !== "object") {
    throw new AppError(400, "VALIDATION_ERROR", "Request body must be an object");
  }

  const email = body.email?.trim().toLowerCase() || "";
  const username = body.username?.trim() || "";
  const password = body.password || "";

  if (!EMAIL_REGEX.test(email)) {
    throw new AppError(400, "VALIDATION_ERROR", "Invalid email format");
  }

  if (username.length < 3 || username.length > 50) {
    throw new AppError(400, "VALIDATION_ERROR", "username must have 3 to 50 characters");
  }

  if (password.length < 8) {
    throw new AppError(400, "VALIDATION_ERROR", "password must have at least 8 characters");
  }

  return {
    email,
    username,
    password,
    fullName: body.fullName || null,
    cpf: body.cpf || null,
    avatarUrl: body.avatarUrl || null,
  };
}

export function validateListUsersQuery(query: any): ListUsersQuery {
  const page = Number(query?.page) || 1;
  const limit = Number(query?.limit) || 20;

  return {
    page: page > 0 ? page : 1,
    limit: limit > 0 && limit <= 100 ? limit : 20,
  };
}

export function validateIdParam(id: string): number {
  const numero = Number(id);

  if (!Number.isInteger(numero) || numero <= 0) {
    throw new AppError(400, "VALIDATION_ERROR", "id must be a positive integer");
  }

  return numero;
}
