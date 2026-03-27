import jwt from "jsonwebtoken";
import { AppError } from "./app-error";
import { JwtPayload } from "../types/express";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();

  if (!secret) {
    throw new AppError(500, "AUTH_CONFIG_ERROR", "JWT_SECRET is not configured");
  }

  return secret;
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "24h" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, getJwtSecret()) as JwtPayload;
}
