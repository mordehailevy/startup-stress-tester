import { Request, Response, NextFunction } from "express";
import { Idea } from "../models/Idea";
import { createAppError } from "../middleware/errorHandler";

function getUserId(req: Request): string {
  return (req as unknown as Record<string, unknown>).userId as string;
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
    const ideas = await Idea.find({ userId: getUserId(req) }).sort({ createdAt: -1 });
    res.json({ success: true, data: { ideas, count: ideas.length } });
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
