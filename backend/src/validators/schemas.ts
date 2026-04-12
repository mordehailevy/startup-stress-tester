import { z } from "zod";

// ── Auth ────────────────────────────────────────
export const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long"),
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name too long")
    .trim(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// ── Idea ────────────────────────────────────────
export const createIdeaSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200).trim(),
  description: z.string().min(20, "Description must be at least 20 characters").max(5000).trim(),
  marketSizeEstimate: z.string().min(3).max(500).trim(),
  teamSummary: z.string().min(3).max(1000).trim(),
  techStack: z.string().min(2).max(500).trim(),
  revenueModel: z.string().min(3).max(1000).trim(),
  stage: z.enum(["idea", "prototype", "mvp", "growth", "scale"]),
});

export const updateIdeaSchema = createIdeaSchema.partial();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateIdeaInput = z.infer<typeof createIdeaSchema>;
export type UpdateIdeaInput = z.infer<typeof updateIdeaSchema>;
