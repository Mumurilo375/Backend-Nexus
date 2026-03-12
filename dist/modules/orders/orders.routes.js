"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ordersRouter = (0, express_1.Router)();
ordersRouter.get("/", (_req, res) => {
    res.status(501).json({
        code: "NOT_IMPLEMENTED",
        message: "GET /orders is not implemented yet",
    });
});
ordersRouter.post("/", (_req, res) => {
    res.status(501).json({
        code: "NOT_IMPLEMENTED",
        message: "POST /orders is not implemented yet",
    });
});
ordersRouter.get("/:id", (_req, res) => {
    res.status(501).json({
        code: "NOT_IMPLEMENTED",
        message: "GET /orders/:id is not implemented yet",
    });
});
exports.default = ordersRouter;
