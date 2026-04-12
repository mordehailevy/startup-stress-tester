import { Request, Response, NextFunction } from "express";
import { Idea } from "../models/Idea";
import { Analysis } from "../models/Analysis";
import { analyzeIdea } from "../services/analysisEngine";
import { createAppError } from "../middleware/errorHandler";

function getUserId(req: Request): string {
  return (req as unknown as Record<string, unknown>).userId as string;
}

/**
 * POST /api/ideas/:ideaId/analyze
 * Run the AI investor panel stress test on an idea.
 */
export async function runAnalysis(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const idea = await Idea.findOne({ _id: req.params.ideaId, userId: getUserId(req) });
    if (!idea) throw createAppError("Idea not found", 404);

    const result = analyzeIdea(idea);

    const analysis = await Analysis.create({
      ideaId: idea._id,
      userId: getUserId(req),
      ...result,
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
    const analyses = await Analysis.find({ ideaId: req.params.ideaId, userId: getUserId(req) }).sort({ createdAt: -1 });
    res.json({ success: true, data: { analyses, count: analyses.length } });
  } catch (error) {
    next(error);
  }
}
