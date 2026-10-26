/** Shared timing and palette for the hero motion piece. */

export const FPS = 30;
export const DURATION = 12 * FPS; // 12 s loop
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

export const INK = "#121836";
export const INK_SOFT = "#1d2550";
export const PAPER = "#f4f6ff";

export const PANELISTS = [
  { label: "Investisseur", focus: "marché, rendement, équipe", color: "#f2b544" },
  { label: "CTO", focus: "faisabilité, stack, complexité", color: "#38bdf8" },
  { label: "Marketing", focus: "cible, canaux, positionnement", color: "#fb7185" },
  { label: "Opérations", focus: "coûts, dépendances, échelle", color: "#34d399" },
] as const;

export const DIMENSIONS = [
  { label: "Tech", score: 74 },
  { label: "Marché", score: 81 },
  { label: "Go-to-market", score: 58 },
  { label: "Scalabilité", score: 77 },
  { label: "Finances", score: 69 },
] as const;

export const OVERALL = 72;

export function scoreColor(score: number): string {
  return score >= 70 ? "#4ade80" : score >= 50 ? "#fbbf24" : "#f87171";
}
