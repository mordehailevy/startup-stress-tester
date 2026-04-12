import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { createAppError } from "./errorHandler";

/**
 * Express middleware factory — validates req.body against a Zod schema.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const messages = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
      next(createAppError(`Validation failed — ${messages.join("; ")}`, 400));
      return;
    }
    req.body = result.data;
    next();
  };
}
