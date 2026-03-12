"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_service_1 = require("../services/user.service");
const user_validator_1 = require("../validators/user.validator");
class UserController {
    static async findAll(req, res, next) {
        try {
            const query = (0, user_validator_1.validateListUsersQuery)(req.query);
            const result = await (0, user_service_1.listUsers)(query);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const id = (0, user_validator_1.validateIdParam)(rawId);
            const result = await (0, user_service_1.getUserById)(id);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const payload = (0, user_validator_1.validateCreateUserInput)(req.body);
            const result = await (0, user_service_1.createUser)(payload);
            res.status(201).json(result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = UserController;
