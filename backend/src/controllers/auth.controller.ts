import { Request, Response, NextFunction } from "express";
import jwt, { Secret } from "jsonwebtoken";
import { User } from "../models/User";
import config from "../config";
import { createAppError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import { createDemoSpace, DEMO_EMAIL, DEMO_PASSWORD, DEMO_TTL_HOURS } from "../demo/demoAccount";

function signToken(userId: string, ttlHours?: number): string {
  const payload = { id: userId };
  const secret: Secret = config.jwtSecret;
  return jwt.sign(payload, secret, { expiresIn: ttlHours ? `${ttlHours}h` : config.jwtExpiresIn });
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

    // The published demo credentials open a fresh demo space, like the demo button.
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      const demo = await createDemoSpace();
      res.json({ success: true, data: { user: demo, token: signToken(demo._id.toString(), DEMO_TTL_HOURS) } });
      return;
    }

    const user = await User.findOne({ email, isDemo: { $ne: true } }).select("+password");
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
 * POST /api/auth/demo — opens a private demo space for this visitor, pre-filled
 * with the showcase ideas and reports. Fully usable; deleted after DEMO_TTL_HOURS.
 */
export async function loginDemo(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await createDemoSpace();
    res.status(201).json({ success: true, data: { user, token: signToken(user._id.toString(), DEMO_TTL_HOURS) } });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/claim — turns the current demo space into a real account,
 * keeping every idea and report the visitor made during the demo.
 */
export async function claimDemo(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const { email, password, fullName } = req.body;

    const user = await User.findById(userId);
    if (!user) throw createAppError("Utilisateur introuvable", 404);
    if (!user.isDemo) throw createAppError("Ce compte est déjà un compte personnel", 400);
    if (await User.exists({ email })) throw createAppError("Un compte existe déjà avec cet e-mail", 409);

    user.email = email;
    user.password = password; // hashed by the pre-save hook
    user.fullName = fullName;
    user.isDemo = false;
    user.demoExpiresAt = undefined;
    await user.save();

    res.json({ success: true, data: { user, token: signToken(user._id.toString()) } });
  } catch (error) {
    next(error);
  }
}
