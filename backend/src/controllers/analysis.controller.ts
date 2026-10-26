import { Request, Response, NextFunction } from "express";
import { Idea } from "../models/Idea";
import { Analysis } from "../models/Analysis";
import { analyzeIdea } from "../services/analysisEngine";
import { enrichWithLlm } from "../services/llmAnalysis";
import { createAppError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import { parsePagination, buildPaginatedResponse } from "../utils/pagination";

function getUserId(req: Request): string {
  return (req as AuthRequest).userId as string;
}

/**
 * POST /api/ideas/:ideaId/analyze
 * Run the investor panel stress test on an idea.
 * Scores come from the rule engine; Gemini writes the panel text when available.
 */
export async function runAnalysis(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const idea = await Idea.findOne({ _id: req.params.ideaId, userId: getUserId(req) });
    if (!idea) throw createAppError("Idea not found", 404);

    const { result, engine } = await enrichWithLlm(idea, analyzeIdea(idea));

    const analysis = await Analysis.create({
      ideaId: idea._id,
      userId: getUserId(req),
      ...result,
      engine,
    });

    res.status(201).json({ success: true, data: { analysis } });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/analyses/:id
 * Retrieve a single analysis by ID.
 */
export async function getAnalysisById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const analysis = await Analysis.findOne({ _id: req.params.id, userId: getUserId(req) }).populate("ideaId");
    if (!analysis) throw createAppError("Analysis not found", 404);
    res.json({ success: true, data: { analysis } });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/ideas/:ideaId/analyses
 * List all analyses for a given idea.
 */
export async function getAnalysesForIdea(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = getUserId(req);
    const pagination = parsePagination(req);
    const filter = { ideaId: req.params.ideaId, userId };

    const [analyses, total] = await Promise.all([
      Analysis.find(filter).sort({ createdAt: -1 }).skip(pagination.skip).limit(pagination.limit),
      Analysis.countDocuments(filter),
    ]);

    res.json({ success: true, ...buildPaginatedResponse(analyses, total, pagination) });
  } catch (error) {
    next(error);
  }
}
