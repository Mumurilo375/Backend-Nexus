"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCreateUserInput = validateCreateUserInput;
exports.validateListUsersQuery = validateListUsersQuery;
exports.validateIdParam = validateIdParam;
const app_error_1 = require("../utils/app-error");
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function asOptionalString(value, field) {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    if (typeof value !== "string") {
        throw new app_error_1.AppError(400, "VALIDATION_ERROR", `${field} must be a string`);
    }
    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
}
function validateCreateUserInput(body) {
    if (typeof body !== "object" || body === null) {
        throw new app_error_1.AppError(400, "VALIDATION_ERROR", "Request body must be an object");
    }
    const payload = body;
    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
    const username = typeof payload.username === "string" ? payload.username.trim() : "";
    const password = typeof payload.password === "string" ? payload.password : "";
    if (!EMAIL_REGEX.test(email)) {
        throw new app_error_1.AppError(400, "VALIDATION_ERROR", "Invalid email format");
    }
    if (username.length < 3 || username.length > 50) {
        throw new app_error_1.AppError(400, "VALIDATION_ERROR", "username must have 3 to 50 characters");
    }
    if (password.length < 8) {
        throw new app_error_1.AppError(400, "VALIDATION_ERROR", "password must have at least 8 characters");
    }
    return {
        email,
        username,
        password,
        fullName: asOptionalString(payload.fullName, "fullName"),
        cpf: asOptionalString(payload.cpf, "cpf"),
        avatarUrl: asOptionalString(payload.avatarUrl, "avatarUrl"),
    };
}
function validateListUsersQuery(query) {
    const q = (query ?? {});
    const pageRaw = Number(q.page ?? 1);
    const limitRaw = Number(q.limit ?? 20);
    const page = Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1;
    const limit = Number.isInteger(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 100) : 20;
    return { page, limit };
}
function validateIdParam(id) {
    const parsedId = Number(id);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
        throw new app_error_1.AppError(400, "VALIDATION_ERROR", "id must be a positive integer");
    }
    return parsedId;
}
