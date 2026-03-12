"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gamesRouter = (0, express_1.Router)();
gamesRouter.get("/", (_req, res) => {
    res.status(501).json({
        code: "NOT_IMPLEMENTED",
        message: "GET /games is not implemented yet",
    });
});
gamesRouter.get("/:id", (_req, res) => {
    res.status(501).json({
        code: "NOT_IMPLEMENTED",
        message: "GET /games/:id is not implemented yet",
    });
});
exports.default = gamesRouter;
