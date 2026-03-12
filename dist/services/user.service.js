"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsers = listUsers;
exports.getUserById = getUserById;
exports.createUser = createUser;
const sequelize_1 = require("sequelize");
const Users_1 = __importDefault(require("../models/Users"));
const app_error_1 = require("../utils/app-error");
const password_1 = require("../utils/password");
function toPublicUser(model) {
    const raw = model.get({ plain: true });
    return {
        id: raw.id,
        email: raw.email,
        username: raw.username,
        fullName: raw.fullName,
        cpf: raw.cpf,
        avatarUrl: raw.avatarUrl,
        isAdmin: raw.isAdmin,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
    };
}
async function listUsers(query) {
    const offset = (query.page - 1) * query.limit;
    const { rows, count } = await Users_1.default.findAndCountAll({
        attributes: { exclude: ["passwordHash"] },
        limit: query.limit,
        offset,
        order: [["createdAt", "DESC"]],
    });
    return {
        items: rows.map(toPublicUser),
        meta: {
            page: query.page,
            limit: query.limit,
            total: count,
            totalPages: Math.max(1, Math.ceil(count / query.limit)),
        },
    };
}
async function getUserById(id) {
    const user = await Users_1.default.findByPk(id, {
        attributes: { exclude: ["passwordHash"] },
    });
    if (!user) {
        throw new app_error_1.AppError(404, "USER_NOT_FOUND", "User not found");
    }
    return toPublicUser(user);
}
async function createUser(input) {
    const existingUser = await Users_1.default.findOne({
        where: {
            [sequelize_1.Op.or]: [{ email: input.email }, { username: input.username }],
        },
    });
    if (existingUser) {
        throw new app_error_1.AppError(409, "USER_ALREADY_EXISTS", "Email or username is already in use");
    }
    const user = await Users_1.default.create({
        email: input.email,
        username: input.username,
        passwordHash: (0, password_1.hashPassword)(input.password),
        fullName: input.fullName ?? null,
        cpf: input.cpf ?? null,
        avatarUrl: input.avatarUrl ?? null,
    });
    return toPublicUser(user);
}
