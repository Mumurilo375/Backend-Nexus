"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundMiddleware = notFoundMiddleware;
exports.errorMiddleware = errorMiddleware;
const app_error_1 = require("../utils/app-error");
function notFoundMiddleware(req, res) {
    res.status(404).json({
        code: "ROUTE_NOT_FOUND",
        message: `Route ${req.method} ${req.originalUrl} not found`,
    });
}
function errorMiddleware(error, _req, res, _next) {
    if ((0, app_error_1.isAppError)(error)) {
        res.status(error.statusCode).json({
            code: error.code,
            message: error.message,
        });
        return;
    }
    console.error("Unhandled error:", error);
    res.status(500).json({
        code: "INTERNAL_SERVER_ERROR",
        message: "Unexpected server error",
    });
}
