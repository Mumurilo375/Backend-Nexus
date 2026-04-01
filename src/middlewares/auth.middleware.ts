import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import Users from "../models/Users";

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ code: "UNAUTHORIZED", message: "Token not provided" });
    return;
  }

  try {
    const payload = verifyToken(header.slice(7));
    const user = await Users.findByPk(payload.id);

    if (!user) {
      res.status(401).json({ code: "UNAUTHORIZED", message: "User not found for this token" });
      return;
    }

    req.user = {
      ...payload,
      isAdmin: Boolean(user.get("isAdmin")),
    };
    next();
  } catch {
    res.status(401).json({ code: "UNAUTHORIZED", message: "Invalid or expired token" });
  }
}
