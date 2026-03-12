"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_routes_1 = __importDefault(require("./users.routes"));
const router = (0, express_1.Router)();
router.get("/", (_req, res) => {
    res.status(200).json({
        name: "nexus-backend",
        status: "ok",
        message: "API is running",
    });
});
router.get("/health", (_req, res) => {
    res.status(200).json({ status: "healthy" });
});
router.use("/users", users_routes_1.default);
exports.default = router;
