import { Request } from "express";
import { AppError } from "./app-error";

export function requireAuthenticatedUserId(req: Request): number {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError(401, "UNAUTHORIZED", "Token not provided");
  }

  return userId;
}
