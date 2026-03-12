import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/express";

const SECRET = process.env.JWT_SECRET ?? "";

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "24h" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload;
}