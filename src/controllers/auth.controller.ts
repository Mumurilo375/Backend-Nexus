import { NextFunction, Request, Response } from "express";
import { loginUser } from "../services/auth.service";
import { validateLoginInput } from "../validators/auth.validator";

class AuthController {
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const loginData = validateLoginInput(req.body);
      const loginResult = await loginUser(loginData);
      res.status(200).json(loginResult);
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;