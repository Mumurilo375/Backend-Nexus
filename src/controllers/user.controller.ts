import { NextFunction, Request, Response } from "express";
import { createUser, getUserById, listUsers } from "../services/user.service";
import {
	validateCreateUserInput,
	validateIdParam,
	validateListUsersQuery,
} from "../validators/user.validator";

class UserController {
    
	static async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const query = validateListUsersQuery(req.query);
			const result = await listUsers(query);
			res.status(200).json(result);
		} catch (error) {
			next(error);
		}
	}

	static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
			const id = validateIdParam(rawId);
			const result = await getUserById(id);
			res.status(200).json(result);
		} catch (error) {
			next(error);
		}
	}

	static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const payload = validateCreateUserInput(req.body);
			const result = await createUser(payload);
			res.status(201).json(result);
		} catch (error) {
			next(error);
		}
	}
}

export default UserController;