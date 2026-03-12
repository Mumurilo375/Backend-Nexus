import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function comparePassword(plain: string, stored: string): boolean {
  if (!stored) {
    return false;
  }

  const parts = stored.split(":");

  if (parts.length !== 3) {
    return false;
  }

  const salt = parts[1];
  const hash = parts[2];
  const buffer = scryptSync(plain, salt, 64);
  return timingSafeEqual(buffer, Buffer.from(hash, "hex"));
}