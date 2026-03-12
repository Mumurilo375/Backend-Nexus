"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_service_1 = __importDefault(require("./user.service"));
const user_validators_1 = require("./user.validators");
class UserController {
    static async findAll(req, res) {
        const query = (0, user_validators_1.validateListUsersQuery)(req.query);
        const result = await user_service_1.default.findAll(query);
        res.status(200).json(result);
    }
    static async getById(req, res) {
        const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const id = (0, user_validators_1.validateIdParam)(rawId);
        const result = await user_service_1.default.getById(id);
        res.status(200).json(result);
    }
    static async create(req, res) {
        const payload = (0, user_validators_1.validateCreateUserInput)(req.body);
        const result = await user_service_1.default.create(payload);
        res.status(201).json(result);
    }
}
exports.default = UserController;
