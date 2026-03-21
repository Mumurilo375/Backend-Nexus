import { AppError } from "../utils/app-error";

export interface LoginInput {
  email: string;
  password: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLoginInput(body: unknown): LoginInput {
  if (!body || typeof body !== "object") {
    throw new AppError(400, "VALIDATION_ERROR", "Request body must be an object");
  }

  const requestBody = body as Record<string, unknown>;
  const email = String(requestBody.email ?? "").trim().toLowerCase();
  const password = String(requestBody.password ?? "");

  if (!EMAIL_REGEX.test(email)) {
    throw new AppError(400, "VALIDATION_ERROR", "Invalid email format");
  }

  if (!password) {
    throw new AppError(400, "VALIDATION_ERROR", "Password is required");
  }

  return { email, password };
}