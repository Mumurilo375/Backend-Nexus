import { AppError } from "../utils/app-error";

export interface LoginInput {
  email: string;
  password: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLoginInput(body: Record<string, unknown>): LoginInput {
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");

  if (!EMAIL_REGEX.test(email)) {
    throw new AppError(400, "VALIDATION_ERROR", "Invalid email format");
  }

  if (!password) {
    throw new AppError(400, "VALIDATION_ERROR", "Password is required");
  }

  return { email, password };
}