"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reviewsRouter = (0, express_1.Router)();
reviewsRouter.get("/games/:gameId", (_req, res) => {
    res.status(501).json({
        code: "NOT_IMPLEMENTED",
        message: "GET /reviews/games/:gameId is not implemented yet",
    });
});
reviewsRouter.post("/games/:gameId", (_req, res) => {
    res.status(501).json({
        code: "NOT_IMPLEMENTED",
        message: "POST /reviews/games/:gameId is not implemented yet",
    });
});
exports.default = reviewsRouter;
