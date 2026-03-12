"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
const crypto_1 = require("crypto");
const SALT_SIZE = 16;
const KEY_LENGTH = 64;
function hashPassword(password) {
    const salt = (0, crypto_1.randomBytes)(SALT_SIZE).toString("hex");
    const hash = (0, crypto_1.scryptSync)(password, salt, KEY_LENGTH).toString("hex");
    return `scrypt:${salt}:${hash}`;
}
