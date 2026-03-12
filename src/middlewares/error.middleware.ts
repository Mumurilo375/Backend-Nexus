import { NextFunction, Request, Response } from "express";
import { isAppError } from "../utils/app-error";

export function notFoundMiddleware(req: Request, res: Response): void {
  res.status(404).json({
    code: "ROUTE_NOT_FOUND",
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
}

export function errorMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (isAppError(error)) {
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
