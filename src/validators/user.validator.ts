import { AppError } from "../utils/app-error";
import { validatePaginationQuery, validatePositiveIdParam } from "../utils/request-validator";

// ── Interfaces ──────────────────────────────────────────────

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
  password: string;
  fullName: string;
  cpf: string;
  avatarUrl?: string | null;
}

export interface ListUsersQuery {
  page: number;
  limit: number;
}

// ── Helpers ─────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function requireString(value: unknown, field: string): string {
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
  const cpf = raw.replace(/\D/g, "");

  if (cpf.length !== 11) {
    throw new AppError(400, "VALIDATION_ERROR", "CPF must have 11 digits");
  }

  if (/^(\d)\1{10}$/.test(cpf)) {
    throw new AppError(400, "VALIDATION_ERROR", "Invalid CPF");
  }

  return cpf;
}

function validatePasswordStrength(password: string): void {
  if (password.length < 8) {
    throw new AppError(400, "VALIDATION_ERROR", "Password must have at least 8 characters");
  }
  if (!/[a-z]/.test(password)) {
    throw new AppError(400, "VALIDATION_ERROR", "Password must have a lowercase letter");
  }
  if (!/[A-Z]/.test(password)) {
    throw new AppError(400, "VALIDATION_ERROR", "Password must have an uppercase letter");
  }
  if (!/\d/.test(password)) {
    throw new AppError(400, "VALIDATION_ERROR", "Password must have a number");
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    throw new AppError(400, "VALIDATION_ERROR", "Password must have a special character");
  }
}

// ── Validators ──────────────────────────────────────────────

export function validateCreateUserInput(body: unknown): CreateUserInput {
  if (!body || typeof body !== "object") {
    throw new AppError(400, "VALIDATION_ERROR", "Request body must be an object");
  }

  const requestBody = body as Record<string, unknown>;

  const email = validateEmail(requireString(requestBody.email, "email"));
  const username = requireString(requestBody.username, "username");
  const password = requireString(requestBody.password, "password");
  const fullName = requireString(requestBody.fullName, "fullName");
  const cpf = validateCpf(requireString(requestBody.cpf, "cpf"));

  if (username.length < 3 || username.length > 50) {
    throw new AppError(400, "VALIDATION_ERROR", "username must have 3 to 50 characters");
  }

  validatePasswordStrength(password);

  return {
    email,
    username,
    password,
    fullName,
    cpf,
    avatarUrl: requestBody.avatarUrl ? String(requestBody.avatarUrl) : null,
  };
}

export function validateUpdateUserInput(body: unknown): UpdateUserInput {
  if (!body || typeof body !== "object") {
    throw new AppError(400, "VALIDATION_ERROR", "Request body must be an object");
  }

  const requestBody = body as Record<string, unknown>;

  if ("email" in requestBody) {
    throw new AppError(400, "VALIDATION_ERROR", "Email cannot be changed");
  }

  const username = requireString(requestBody.username, "username");
  if (username.length < 3 || username.length > 50) {
    throw new AppError(400, "VALIDATION_ERROR", "username must have 3 to 50 characters");
  }

  const password = requireString(requestBody.password, "password");
  validatePasswordStrength(password);

  const fullName = requireString(requestBody.fullName, "fullName");
  const cpf = validateCpf(requireString(requestBody.cpf, "cpf"));

  return {
    username,
    password,
    fullName,
    cpf,
    avatarUrl: requestBody.avatarUrl !== undefined
      ? (requestBody.avatarUrl ? String(requestBody.avatarUrl) : null)
      : undefined,
  };
}

export function validateListUsersQuery(query: unknown): ListUsersQuery {
  const safeQuery = query && typeof query === "object" ? (query as Record<string, unknown>) : {};
  return validatePaginationQuery(safeQuery);
}

export function validateIdParam(id: string): number {
  return validatePositiveIdParam(id);
}
