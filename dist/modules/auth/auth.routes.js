"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authRouter = (0, express_1.Router)();
authRouter.post("/register", (_req, res) => {
    res.status(501).json({
        code: "NOT_IMPLEMENTED",
        message: "POST /auth/register is not implemented yet",
    });
});
authRouter.post("/login", (_req, res) => {
    res.status(501).json({
        code: "NOT_IMPLEMENTED",
        message: "POST /auth/login is not implemented yet",
    });
});
exports.default = authRouter;
