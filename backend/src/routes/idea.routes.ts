import { Router } from "express";
import rateLimit from "express-rate-limit";
import config from "../config";
import { authenticate, AuthRequest } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createIdeaSchema, updateIdeaSchema } from "../validators/schemas";
import {
  createIdea,
  getIdeas,
  getIdeaById,
  updateIdea,
  deleteIdea,
} from "../controllers/idea.controller";
import { runAnalysis, getAnalysesForIdea } from "../controllers/analysis.controller";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Each analysis may call Gemini: cap it per user so nobody can drain the free quota.
const analyzeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: config.aiHourlyLimitPerUser,
  keyGenerator: (req) => (req as AuthRequest).userId as string,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: "Too many analyses this hour, please try again later" } },
});

/**
 * @openapi
 * /ideas:
 *   get:
 *     tags: [Ideas]
 *     summary: List all ideas (paginated)
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *     responses:
 *       200: { description: Paginated list of ideas }
 *   post:
 *     tags: [Ideas]
 *     summary: Create a new startup idea
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, marketSizeEstimate, teamSummary, techStack, revenueModel, stage]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               marketSizeEstimate: { type: string }
 *               teamSummary: { type: string }
 *               techStack: { type: string }
 *               revenueModel: { type: string }
 *               stage: { type: string, enum: [idea, prototype, mvp, growth, scale] }
 *     responses:
 *       201: { description: Idea created }
 */
router.route("/")
  .get(getIdeas)
  .post(validate(createIdeaSchema), createIdea);

/**
 * @openapi
 * /ideas/{id}:
 *   get:
 *     tags: [Ideas]
 *     summary: Get a single idea
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Idea details }
 *       404: { description: Idea not found }
 *   put:
 *     tags: [Ideas]
 *     summary: Update an idea
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Idea updated }
 *   delete:
 *     tags: [Ideas]
 *     summary: Delete an idea
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Idea deleted }
 */
router.route("/:id")
  .get(getIdeaById)
  .put(validate(updateIdeaSchema), updateIdea)
  .delete(deleteIdea);

/**
 * @openapi
 * /ideas/{ideaId}/analyze:
 *   post:
 *     tags: [Analyses]
 *     summary: Run AI stress test on an idea
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: ideaId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201: { description: Analysis generated }
 * /ideas/{ideaId}/analyses:
 *   get:
 *     tags: [Analyses]
 *     summary: List analyses for an idea (paginated)
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: ideaId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: Paginated list of analyses }
 */
router.post("/:ideaId/analyze", analyzeLimiter, runAnalysis);
router.get("/:ideaId/analyses", getAnalysesForIdea);

export default router;
