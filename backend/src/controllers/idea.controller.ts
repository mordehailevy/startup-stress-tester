import { Request, Response, NextFunction } from "express";
import { Idea } from "../models/Idea";
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

export async function getIdeas(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = getUserId(req);
    const pagination = parsePagination(req);
    const filter = { userId };

    const [ideas, total] = await Promise.all([
      Idea.find(filter).sort({ createdAt: -1 }).skip(pagination.skip).limit(pagination.limit),
      Idea.countDocuments(filter),
    ]);

    res.json({ success: true, ...buildPaginatedResponse(ideas, total, pagination) });
  } catch (error) {
    next(error);
  }
}

export async function getIdeaById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const idea = await Idea.findOne({ _id: req.params.id, userId: getUserId(req) });
    if (!idea) throw createAppError("Idea not found", 404);
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
    if (!idea) throw createAppError("Idea not found", 404);
    res.json({ success: true, data: { idea } });
  } catch (error) {
    next(error);
  }
}

export async function deleteIdea(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const idea = await Idea.findOneAndDelete({ _id: req.params.id, userId: getUserId(req) });
    if (!idea) throw createAppError("Idea not found", 404);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
