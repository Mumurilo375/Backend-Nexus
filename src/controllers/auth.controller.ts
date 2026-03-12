import { NextFunction, Request, Response } from "express";
import { loginUser } from "../services/auth.service";
import { validateLoginInput } from "../validators/auth.validator";

class AuthController {
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = validateLoginInput(req.body as Record<string, unknown>);
      const result = await loginUser(input);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;