import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { getAnalysisById } from "../controllers/analysis.controller";

const router = Router();

router.use(authenticate);

router.get("/:id", getAnalysisById);

export default router;
