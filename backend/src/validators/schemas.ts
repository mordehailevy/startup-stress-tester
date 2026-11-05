import { z } from "zod";

// ── Auth ────────────────────────────────────────
export const registerSchema = z.object({
  email: z.string().email("adresse e-mail invalide"),
  password: z
    .string()
    .min(8, "8 caractères minimum")
    .max(128, "128 caractères maximum"),
  fullName: z
    .string()
    .min(2, "2 caractères minimum")
    .max(100, "100 caractères maximum")
    .trim(),
});

export const loginSchema = z.object({
  email: z.string().email("adresse e-mail invalide"),
  password: z.string().min(1, "obligatoire"),
});

// ── Idea ────────────────────────────────────────
export const createIdeaSchema = z.object({
  title: z.string().min(3, "3 caractères minimum").max(200, "200 caractères maximum").trim(),
  description: z.string().min(20, "20 caractères minimum").max(5000, "5000 caractères maximum").trim(),
  marketSizeEstimate: z.string().min(3, "3 caractères minimum").max(500, "500 caractères maximum").trim(),
  teamSummary: z.string().min(3, "3 caractères minimum").max(1000, "1000 caractères maximum").trim(),
  techStack: z.string().min(2, "2 caractères minimum").max(500, "500 caractères maximum").trim(),
  revenueModel: z.string().min(3, "3 caractères minimum").max(1000, "1000 caractères maximum").trim(),
  stage: z.enum(["idea", "prototype", "mvp", "growth", "scale"]),
});

export const updateIdeaSchema = createIdeaSchema.partial();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateIdeaInput = z.infer<typeof createIdeaSchema>;
export type UpdateIdeaInput = z.infer<typeof updateIdeaSchema>;
