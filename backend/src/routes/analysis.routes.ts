import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { getAnalysisById } from "../controllers/analysis.controller";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /analyses/{id}:
 *   get:
 *     tags: [Analyses]
 *     summary: Get a single analysis report
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Full analysis report with scores, risks, recommendations, panelist feedbacks }
 *       404: { description: Analysis not found }
 */
router.get("/:id", getAnalysisById);

export default router;
