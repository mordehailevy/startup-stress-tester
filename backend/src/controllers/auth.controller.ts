import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import config from "../config";
import { createAppError } from "../middleware/errorHandler";

function signToken(userId: string): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (jwt as any).sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, fullName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createAppError("Email already registered", 409);
    }

    const user = await User.create({ email, password, fullName });
    const token = signToken(user._id.toString());

    res.status(201).json({
      success: true,
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      throw createAppError("Invalid email or password", 401);
    }

    const token = signToken(user._id.toString());

    res.json({
      success: true,
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as unknown as Record<string, unknown>).userId as string;
    const user = await User.findById(userId);
    if (!user) throw createAppError("User not found", 404);

    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
}
