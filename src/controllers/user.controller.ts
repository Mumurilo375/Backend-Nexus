import { NextFunction, Request, Response } from "express";
import { createUser, deleteUser, getUserById, listUsers, updateUser } from "../services/user.service";
import {
  validateCreateUserInput,
  validateIdParam,
  validateListUsersQuery,
  validateUpdateUserInput,
} from "../validators/user.validator";

class UserController {
  static async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = validateListUsersQuery(req.query as Record<string, unknown>);
      const result = await listUsers(query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = validateIdParam(req.params.id as string);
      const result = await getUserById(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = validateCreateUserInput(req.body as Record<string, unknown>);
      const result = await createUser(payload);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = validateIdParam(req.params.id as string);
      const payload = validateUpdateUserInput(req.body as Record<string, unknown>);
      const result = await updateUser(id, req.user!.id, payload);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = validateIdParam(req.params.id as string);
      await deleteUser(id, req.user!.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;