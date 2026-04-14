import { AppError } from "../utils/app-error";
import { readRequestBody } from "../utils/request-validator";
import { InputValue } from "../utils/value-types";

export interface LoginInput {
  email: string;
  password: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLoginInput(body: InputValue | null | undefined): LoginInput {
  const requestBody = readRequestBody(body);
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
