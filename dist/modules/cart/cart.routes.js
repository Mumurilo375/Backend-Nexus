"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cartRouter = (0, express_1.Router)();
cartRouter.get("/", (_req, res) => {
    res.status(501).json({
        code: "NOT_IMPLEMENTED",
        message: "GET /cart is not implemented yet",
    });
});
cartRouter.post("/", (_req, res) => {
    res.status(501).json({
        code: "NOT_IMPLEMENTED",
        message: "POST /cart is not implemented yet",
    });
});
cartRouter.delete("/:id", (_req, res) => {
    res.status(501).json({
        code: "NOT_IMPLEMENTED",
        message: "DELETE /cart/:id is not implemented yet",
    });
});
exports.default = cartRouter;
