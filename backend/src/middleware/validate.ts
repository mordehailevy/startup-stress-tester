import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { createAppError } from "./errorHandler";

/** French field names for validation messages. */
const FIELD_FR: Record<string, string> = {
  email: "E-mail",
  password: "Mot de passe",
  fullName: "Nom",
  title: "Nom du projet",
  description: "Description",
  marketSizeEstimate: "Taille du marché",
  teamSummary: "Équipe",
  techStack: "Stack technique",
  revenueModel: "Modèle économique",
  stage: "Stade",
};

/**
 * Express middleware factory — validates req.body against a Zod schema.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const messages = result.error.errors.map((e) => {
        const field = FIELD_FR[String(e.path[0])] ?? e.path.join(".");
        return `${field} : ${e.message}`;
      });
      next(createAppError(`Formulaire incomplet. ${messages.join(" · ")}`, 400));
      return;
    }
    req.body = result.data;
    next();
  };
}
