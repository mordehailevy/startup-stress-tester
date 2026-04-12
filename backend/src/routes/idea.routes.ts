import { Router } from "express";
import { authenticate } from "../middleware/auth";
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

router.route("/")
  .get(getIdeas)
  .post(validate(createIdeaSchema), createIdea);

router.route("/:id")
  .get(getIdeaById)
  .put(validate(updateIdeaSchema), updateIdea)
  .delete(deleteIdea);

// Analysis sub-routes
router.post("/:ideaId/analyze", runAnalysis);
router.get("/:ideaId/analyses", getAnalysesForIdea);

export default router;
