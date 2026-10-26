import { Request, Response, NextFunction } from "express";
import jwt, { Secret } from "jsonwebtoken";
import { User } from "../models/User";
import config from "../config";
import { createAppError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import { ensureDemoAccount, DEMO_EMAIL } from "../demo/demoAccount";

function signToken(userId: string): string {
  const payload = { id: userId };
  const secret: Secret = config.jwtSecret;
  return jwt.sign(payload, secret, { expiresIn: config.jwtExpiresIn });
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, fullName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createAppError("Un compte existe déjà avec cet e-mail", 409);
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
      throw createAppError("E-mail ou mot de passe incorrect", 401);
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
    const { userId } = req as AuthRequest;
    const user = await User.findById(userId);
    if (!user) throw createAppError("Utilisateur introuvable", 404);

    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/demo — one-click access to the shared, read-only demo account.
 * No password needed: the account only holds showcase data.
 */
export async function loginDemo(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await ensureDemoAccount();
    const user = await User.findOne({ email: DEMO_EMAIL });
    if (!user) throw createAppError("Le compte démo est indisponible", 503);
    res.json({ success: true, data: { user, token: signToken(user._id.toString()) } });
  } catch (error) {
    next(error);
  }
}
