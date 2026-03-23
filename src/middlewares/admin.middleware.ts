import { NextFunction, Request, Response } from "express";
import Users from "../models/Users";

export async function adminMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ code: "UNAUTHORIZED", message: "Token not provided" });
    return;
  }

  const user = await Users.findByPk(userId);

  if (!user || !user.get("isAdmin")) {
    res.status(403).json({ code: "FORBIDDEN", message: "Admin access required" });
    return;
  }

  next();
}
