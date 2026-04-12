import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import { User } from "../models/User";
import { createAppError } from "./errorHandler";

export interface AuthRequest extends Request {
  userId?: string;
}

export async function authenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw createAppError("Authentication required — provide a Bearer token", 401);
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string };

    const user = await User.findById(decoded.id).select("_id");
    if (!user) {
      throw createAppError("User no longer exists", 401);
    }

    req.userId = user._id.toString();
    next();
  } catch (error) {
    if ((error as AppError).statusCode) {
      next(error);
    } else {
      next(createAppError("Invalid or expired token", 401));
    }
  }
}

interface AppError extends Error {
  statusCode: number;
}
