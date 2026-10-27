/** Shared timing, palette and data shape for the motion piece. */

export const FPS = 30;
export const DURATION = 12 * FPS; // 12 s
export const WIDTH = 1600;
export const HEIGHT = 900;

/** Scene beats, in frames. */
export const BEATS = {
  ideaIn: [0, 50],
  panelIn: [45, 95],
  scan: [95, 195], // each panelist lights for 25 frames
  collapse: [195, 235],
  bars: [225, 285],
  verdict: [280, 330],
  fadeOut: [335, 360],
} as const;

/** The panel-only stretch, looped while a real analysis is running. */
export const PANEL_LOOP = { inFrame: 60, outFrame: 194 } as const;

export const INK = "#121836";
export const INK_SOFT = "#1d2550";
export const PAPER = "#f4f6ff";

export const PANELISTS = [
  { label: "Investisseur", focus: "marché, rendement, équipe", color: "#f2b544" },
  { label: "CTO", focus: "faisabilité, stack, complexité", color: "#38bdf8" },
  { label: "Marketing", focus: "cible, canaux, positionnement", color: "#fb7185" },
  { label: "Opérations", focus: "coûts, dépendances, échelle", color: "#34d399" },
] as const;

export const VERDICT_FR: Record<string, string> = {
  strong: "Solide",
  promising: "Prometteur",
  "needs-work": "À retravailler",
  weak: "Fragile",
};

/** What the film shows. Every prop has a showcase default, used by the landing loop. */
export interface FilmProps extends Record<string, unknown> {
  /** "loop": marketing loop that fades out; "report": plays once and holds on the verdict. */
  mode?: "loop" | "report";
  ideaTitle?: string;
  overall?: number;
  verdict?: string;
  scores?: { tech: number; market: number; goToMarket: number; scalability: number; financial: number };
}

export const SHOWCASE: Required<FilmProps> = {
  mode: "loop",
  ideaTitle: "",
  overall: 72,
  verdict: "promising",
  scores: { tech: 74, market: 81, goToMarket: 58, scalability: 77, financial: 69 },
};

export function dimensionsOf(scores: Required<FilmProps>["scores"]) {
  return [
    { label: "Tech", score: scores.tech },
    { label: "Marché", score: scores.market },
    { label: "Go-to-market", score: scores.goToMarket },
    { label: "Scalabilité", score: scores.scalability },
    { label: "Finances", score: scores.financial },
  ];
}

export function scoreColor(score: number): string {
  return score >= 70 ? "#4ade80" : score >= 50 ? "#fbbf24" : "#f87171";
}
