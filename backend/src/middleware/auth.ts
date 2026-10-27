import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import { User } from "../models/User";
import { createAppError } from "./errorHandler";

export interface AuthRequest extends Request {
  userId?: string;
  isDemo?: boolean;
}

export async function authenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw createAppError("Connexion requise", 401);
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string };

    const user = await User.findById(decoded.id).select("_id isDemo");
    if (!user) {
      throw createAppError("Ce compte n'existe plus", 401);
    }

    req.userId = user._id.toString();
    req.isDemo = Boolean(user.isDemo);
    next();
  } catch (error) {
    if ((error as AppError).statusCode) {
      next(error);
    } else {
      next(createAppError("Session expirée, reconnecte-toi", 401));
    }
  }
}

interface AppError extends Error {
  statusCode: number;
}
