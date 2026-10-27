/** Shared vocabulary for scores, verdicts and the panel, so every page speaks the same language. */

export type Verdict = "strong" | "promising" | "needs-work" | "weak";

export const VERDICT_LABEL: Record<string, string> = {
  strong: "Solide",
  promising: "Prometteur",
  "needs-work": "À retravailler",
  weak: "Fragile",
};

export const VERDICT_BADGE: Record<string, string> = {
  strong: "bg-green-100 text-green-800",
  promising: "bg-brand-100 text-brand-800",
  "needs-work": "bg-amber-100 text-amber-800",
  weak: "bg-red-100 text-red-800",
};

/** Panel role IDs come from the API in English; this is how they read in the UI. */
export const ROLE_LABEL: Record<string, string> = {
  "Venture Capital Investor": "Investisseur",
  "CTO / Tech Lead": "CTO",
  "Marketing Strategist": "Stratège marketing",
  "Operations & Supply Analyst": "Analyste opérations",
};

export const SEVERITY_LABEL: Record<string, string> = {
  critical: "critique",
  high: "élevé",
  medium: "moyen",
  low: "faible",
};

export const PRIORITY_LABEL: Record<string, string> = {
  high: "priorité",
  medium: "ensuite",
  low: "plus tard",
};

export const STAGE_LABEL: Record<string, string> = {
  idea: "Idée",
  prototype: "Prototype",
  mvp: "MVP",
  growth: "Croissance",
  scale: "Expansion",
};

/** Tailwind text colour for a 0–100 score. */
export function scoreText(score: number): string {
  return score >= 70 ? "text-green-600" : score >= 50 ? "text-amber-600" : "text-red-600";
}

/** Raw colour for SVG strokes (same thresholds as scoreText). */
export function scoreHex(score: number): string {
  return score >= 70 ? "#16a34a" : score >= 50 ? "#d97706" : "#dc2626";
}

export const DIMENSIONS = [
  { key: "tech", label: "Tech" },
  { key: "market", label: "Marché" },
  { key: "goToMarket", label: "Go-to-market" },
  { key: "scalability", label: "Scalabilité" },
  { key: "financial", label: "Finances" },
] as const;

export type DimensionKey = (typeof DIMENSIONS)[number]["key"];
export type Scores = Record<DimensionKey, number>;

/** "fr-FR" short date + time, the same everywhere. */
export function formatDate(iso: string, withTime = true): string {
  const d = new Date(iso);
  return withTime
    ? d.toLocaleString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}
