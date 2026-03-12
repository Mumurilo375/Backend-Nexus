"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
const crypto_1 = require("crypto");
function hashPassword(password) {
    const salt = (0, crypto_1.randomBytes)(16).toString("hex");
    const hash = (0, crypto_1.scryptSync)(password, salt, 64).toString("hex");
    return `scrypt:${salt}:${hash}`;
}
