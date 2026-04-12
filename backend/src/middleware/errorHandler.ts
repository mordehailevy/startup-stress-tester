import { Request, Response, NextFunction } from "express";
import config from "../config";
import logger from "../config/logger";

export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

export function createAppError(message: string, statusCode: number): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(createAppError(`Route ${req.method} ${req.originalUrl} not found`, 404));
}

export function globalErrorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : "Internal server error";

  if (!config.isProduction) {
    logger.error({ err, statusCode, message }, "🔴 Request error");
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(config.isProduction ? {} : { stack: err.stack }),
    },
  });
}
