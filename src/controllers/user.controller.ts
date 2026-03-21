import { NextFunction, Request, Response } from "express";
import { createUser, deleteUser, getUserById, listUsers, updateUser } from "../services/user.service";
import { AppError } from "../utils/app-error";
import {
  validateCreateUserInput,
  validateIdParam,
  validateListUsersQuery,
  validateUpdateUserInput,
} from "../validators/user.validator";

function getAuthenticatedUserId(req: Request): number {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "User not authenticated");
  }

  return req.user.id;
}

class UserController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // req.query sao os parametros opcionais da URL, por exemplo: ?page=2&limit=10
      const paginationFilters = validateListUsersQuery(req.query);
      const usersPage = await listUsers(paginationFilters);
      res.status(200).json(usersPage);
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = validateIdParam(req.params.id as string);
      const user = await getUserById(userId);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const newUserData = validateCreateUserInput(req.body);
      const createdUser = await createUser(newUserData);
      res.status(201).json(createdUser);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const targetUserId = validateIdParam(req.params.id as string);
      const updatedUserData = validateUpdateUserInput(req.body);
      const authenticatedUserId = getAuthenticatedUserId(req);

      const updatedUser = await updateUser(targetUserId, authenticatedUserId, updatedUserData);
      res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const targetUserId = validateIdParam(req.params.id as string);
      const authenticatedUserId = getAuthenticatedUserId(req);

      await deleteUser(targetUserId, authenticatedUserId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;