import { AppError } from "../utils/app-error";
import { isValidCpf, normalizeCpf } from "../utils/cpf";
import {
  readQueryParams,
  readRequestBody,
  validatePaginationQuery,
  validatePositiveIdParam,
} from "../utils/request-validator";
import { InputValue } from "../utils/value-types";

export interface CreateUserInput {
  email: string;
  username: string;
  password: string;
  fullName: string;
  cpf: string;
  avatarUrl?: string | null;
}

export interface UpdateUserInput {
  username: string;
  password?: string;
  fullName: string;
  cpf: string;
  avatarUrl?: string | null;
}

export interface ListUsersQuery {
  page: number;
  limit: number;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_AVATAR_URL_LENGTH = 2_000_000;

function requireString(value: InputValue, field: string): string {
  const str = String(value ?? "").trim();
  if (!str) {
    throw new AppError(400, "VALIDATION_ERROR", `${field} is required`);
  }
  return str;
}

function validateEmail(email: string): string {
  const clean = email.toLowerCase();
  if (!EMAIL_REGEX.test(clean)) {
    throw new AppError(400, "VALIDATION_ERROR", "Invalid email format");
  }
  return clean;
}

function validateCpf(raw: string): string {
  const cpf = normalizeCpf(raw);

  if (cpf.length !== 11) {
    throw new AppError(400, "VALIDATION_ERROR", "CPF must have 11 digits");
  }

  if (!isValidCpf(cpf)) {
    throw new AppError(400, "VALIDATION_ERROR", "Invalid CPF");
  }

  return cpf;
}

function validatePasswordStrength(password: string): void {
  if (password.length < 8) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "Password must have at least 8 characters",
    );
  }
  if (!/[a-z]/.test(password)) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "Password must have a lowercase letter",
    );
  }
  if (!/[A-Z]/.test(password)) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "Password must have an uppercase letter",
    );
  }
  if (!/\d/.test(password)) {
    throw new AppError(400, "VALIDATION_ERROR", "Password must have a number");
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "Password must have a special character",
    );
  }
}

function normalizeAvatarUrl(value: InputValue): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  const normalized = String(value).trim();
  if (!normalized) {
    return null;
  }

  if (normalized.length > MAX_AVATAR_URL_LENGTH) {
    throw new AppError(400, "VALIDATION_ERROR", "avatarUrl is too large");
  }

  return normalized;
}

export function validateCreateUserInput(
  body: InputValue | null | undefined,
): CreateUserInput {
  const requestBody = readRequestBody(body);
  const email = validateEmail(requireString(requestBody.email, "email"));
  const username = requireString(requestBody.username, "username");
  const password = requireString(requestBody.password, "password");
  const fullName = requireString(requestBody.fullName, "fullName");
  const cpf = validateCpf(requireString(requestBody.cpf, "cpf"));

  if (username.length < 3 || username.length > 50) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "username must have 3 to 50 characters",
    );
  }

  validatePasswordStrength(password);

  return {
    email,
    username,
    password,
    fullName,
    cpf,
    avatarUrl: normalizeAvatarUrl(requestBody.avatarUrl),
  };
}

export function validateUpdateUserInput(
  body: InputValue | null | undefined,
): UpdateUserInput {
  const requestBody = readRequestBody(body);

  if ("email" in requestBody) {
    throw new AppError(400, "VALIDATION_ERROR", "Email cannot be changed");
  }

  const username = requireString(requestBody.username, "username");
  if (username.length < 3 || username.length > 50) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "username must have 3 to 50 characters",
    );
  }

  const rawPassword = requestBody.password;
  const password =
    rawPassword === undefined || rawPassword === null
      ? undefined
      : String(rawPassword).trim();

  if (password !== undefined) {
    if (!password) {
      throw new AppError(400, "VALIDATION_ERROR", "password is required");
    }

    validatePasswordStrength(password);
  }

  const fullName = requireString(requestBody.fullName, "fullName");
  const cpf = validateCpf(requireString(requestBody.cpf, "cpf"));

  return {
    username,
    ...(password !== undefined ? { password } : {}),
    fullName,
    cpf,
    avatarUrl:
      requestBody.avatarUrl !== undefined
        ? normalizeAvatarUrl(requestBody.avatarUrl)
        : undefined,
  };
}

export function validateListUsersQuery(query: InputValue | null | undefined): ListUsersQuery {
  return validatePaginationQuery(readQueryParams(query));
}

export function validateIdParam(id: string): number {
  return validatePositiveIdParam(id);
}
