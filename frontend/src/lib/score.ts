/** Shared score / verdict presentation, so every page speaks the same language. */

export type Verdict = "strong" | "promising" | "needs-work" | "weak";

export const VERDICT_LABEL: Record<string, string> = {
  strong: "Strong",
  promising: "Promising",
  "needs-work": "Needs work",
  weak: "Weak",
};

export const VERDICT_BADGE: Record<string, string> = {
  strong: "bg-green-100 text-green-800",
  promising: "bg-brand-100 text-brand-800",
  "needs-work": "bg-amber-100 text-amber-800",
  weak: "bg-red-100 text-red-800",
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
  { key: "market", label: "Market" },
  { key: "goToMarket", label: "Go-to-market" },
  { key: "scalability", label: "Scalability" },
  { key: "financial", label: "Financial" },
] as const;

export type DimensionKey = (typeof DIMENSIONS)[number]["key"];
export type Scores = Record<DimensionKey, number>;
