import { Router } from "express";
import rateLimit from "express-rate-limit";
import { register, login, getMe, loginDemo, claimDemo } from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import { registerSchema, loginSchema } from "../validators/schemas";

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, fullName]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *               fullName: { type: string }
 *     responses:
 *       201: { description: User created, returns user + JWT token }
 *       409: { description: Email already registered }
 */
router.post("/register", validate(registerSchema), register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: Returns user + JWT token }
 *       401: { description: Invalid credentials }
 */
router.post("/login", validate(loginSchema), login);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current authenticated user
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200: { description: Returns user profile }
 *       401: { description: Not authenticated }
 */
router.get("/me", authenticate, getMe);

// Each demo opens a new pre-filled space: cap how many one IP can open.
const demoLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: "Trop de démos ouvertes depuis cette connexion, réessaie dans une heure" } },
});

router.post("/demo", demoLimiter, loginDemo);

router.post("/claim", authenticate, validate(registerSchema), claimDemo);

export default router;
