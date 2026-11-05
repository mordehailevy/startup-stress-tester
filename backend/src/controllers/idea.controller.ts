import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { Idea } from "../models/Idea";
import { Analysis } from "../models/Analysis";
import { createAppError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import { parsePagination, buildPaginatedResponse } from "../utils/pagination";

function getUserId(req: Request): string {
  return (req as AuthRequest).userId as string;
}

export async function createIdea(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const idea = await Idea.create({ ...req.body, userId: getUserId(req) });
    res.status(201).json({ success: true, data: { idea } });
  } catch (error) {
    next(error);
  }
}

const HISTORY_LENGTH = 8;

interface ScoreSummary {
  latestScore: number | null;
  latestVerdict: string | null;
  scoreHistory: number[]; // oldest → newest, at most HISTORY_LENGTH
}

/** Latest score, verdict and recent score history for each idea, in one query. */
async function getScoreSummaries(ideaIds: Types.ObjectId[], userId: string): Promise<Map<string, ScoreSummary>> {
  if (ideaIds.length === 0) return new Map();
  const rows: { _id: Types.ObjectId; scores: number[]; verdicts: string[] }[] = await Analysis.aggregate([
    { $match: { ideaId: { $in: ideaIds }, userId: new Types.ObjectId(userId) } },
    { $sort: { createdAt: -1 } },
    { $group: { _id: "$ideaId", scores: { $push: "$overallScore" }, verdicts: { $push: "$verdict" } } },
  ]);
  return new Map(
    rows.map((r) => [
      String(r._id),
      {
        latestScore: r.scores[0] ?? null,
        latestVerdict: r.verdicts[0] ?? null,
        scoreHistory: r.scores.slice(0, HISTORY_LENGTH).reverse(),
      },
    ])
  );
}

export async function getIdeas(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = getUserId(req);
    const pagination = parsePagination(req);
    const filter = { userId };

    const [ideas, total] = await Promise.all([
      Idea.find(filter).sort({ createdAt: -1 }).skip(pagination.skip).limit(pagination.limit),
      Idea.countDocuments(filter),
    ]);

    const summaries = await getScoreSummaries(ideas.map((i) => i._id as Types.ObjectId), userId);
    const withScores = ideas.map((idea) => ({
      ...idea.toObject(),
      ...(summaries.get(String(idea._id)) ?? { latestScore: null, latestVerdict: null, scoreHistory: [] }),
    }));

    res.json({ success: true, ...buildPaginatedResponse(withScores, total, pagination) });
  } catch (error) {
    next(error);
  }
}

export async function getIdeaById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const idea = await Idea.findOne({ _id: req.params.id, userId: getUserId(req) });
    if (!idea) throw createAppError("Idée introuvable", 404);
    res.json({ success: true, data: { idea } });
  } catch (error) {
    next(error);
  }
}

export async function updateIdea(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const idea = await Idea.findOneAndUpdate(
      { _id: req.params.id, userId: getUserId(req) },
      req.body,
      { new: true, runValidators: true }
    );
    if (!idea) throw createAppError("Idée introuvable", 404);
    res.json({ success: true, data: { idea } });
  } catch (error) {
    next(error);
  }
}

export async function deleteIdea(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const idea = await Idea.findOneAndDelete({ _id: req.params.id, userId: getUserId(req) });
    if (!idea) throw createAppError("Idée introuvable", 404);
    await Analysis.deleteMany({ ideaId: idea._id });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
