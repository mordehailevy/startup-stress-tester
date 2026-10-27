/**
 * Builds ready-to-paste prompts that help a founder fix the weakest parts of
 * their dossier, so the next stress test scores higher for real reasons.
 *
 * The prompts tell the assistant to ASK for missing facts instead of inventing
 * them: a better score built on made-up traction would mislead the founder.
 */
import type { DimensionKey, Scores } from "./score";

export type PromptLang = "fr" | "en";

export interface IdeaDossier {
  title: string;
  description: string;
  marketSizeEstimate: string;
  teamSummary: string;
  techStack: string;
  revenueModel: string;
  stage: string;
}

export interface PanelFeedback {
  role: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
}

export type IdeaField = keyof Omit<IdeaDossier, "title" | "stage">;

export interface CoachPrompt {
  id: string;
  dimension: DimensionKey | "all";
  score: number | null;
  title: string;
  fields: IdeaField[];
  text: string;
}

/** Which panelists drive each dimension (mirrors the backend's aggregateScores). */
const DIMENSION_ROLES: Record<DimensionKey, string[]> = {
  tech: ["CTO / Tech Lead"],
  market: ["Venture Capital Investor", "Marketing Strategist"],
  goToMarket: ["Marketing Strategist"],
  scalability: ["CTO / Tech Lead", "Operations & Supply Analyst"],
  financial: ["Venture Capital Investor", "Operations & Supply Analyst"],
};

/** Character limits enforced by the API (backend/src/validators/schemas.ts), with a safety margin. */
const FIELD_MAX: Record<IdeaField, number> = {
  description: 1200,
  marketSizeEstimate: 450,
  teamSummary: 900,
  techStack: 450,
  revenueModel: 900,
};

function limits(fields: IdeaField[], lang: PromptLang): string {
  return fields.map((f) => `${FIELD_LABEL[lang][f]} ≤ ${FIELD_MAX[f]}`).join(", ");
}

/** Which form fields to rewrite to move each dimension. */
const DIMENSION_FIELDS: Record<DimensionKey, IdeaField[]> = {
  tech: ["techStack", "teamSummary"],
  market: ["marketSizeEstimate", "description"],
  goToMarket: ["description"],
  scalability: ["techStack", "revenueModel"],
  financial: ["revenueModel"],
};

const FIELD_LABEL: Record<PromptLang, Record<IdeaField, string>> = {
  fr: {
    description: "Description",
    marketSizeEstimate: "Taille du marché",
    teamSummary: "Équipe",
    techStack: "Stack technique",
    revenueModel: "Modèle économique",
  },
  en: {
    description: "Description",
    marketSizeEstimate: "Market size",
    teamSummary: "Team",
    techStack: "Tech stack",
    revenueModel: "Revenue model",
  },
};

const DIM_LABEL: Record<PromptLang, Record<DimensionKey, string>> = {
  fr: { tech: "Tech", market: "Marché", goToMarket: "Go-to-market", scalability: "Scalabilité", financial: "Finances" },
  en: { tech: "Tech", market: "Market", goToMarket: "Go-to-market", scalability: "Scalability", financial: "Financial" },
};

/** What a strong answer looks like for each dimension — the "bar" the assistant should coach toward. */
const GOAL: Record<PromptLang, Record<DimensionKey, string>> = {
  fr: {
    tech: "une stack éprouvée et justifiée, une architecture simple pour le MVP, des risques techniques identifiés avec un plan pour les lever, et une équipe dont l'expérience couvre ce qu'il faut construire",
    market: "une taille de marché calculée de bas en haut (nombre d'acheteurs × prix), une source pour chaque chiffre, un segment de départ précis et un segment d'expansion",
    goToMarket: "un client idéal précis (qui il est, sa situation, ce qui le pousse à chercher une solution), un ou deux canaux d'acquisition testables avec un budget, et un avantage concurrentiel difficile à copier",
    scalability: "ce qui reste stable quand le volume ×10 : architecture, coûts variables, opérations automatisées, dépendances externes maîtrisées",
    financial: "un prix clair par offre, des revenus récurrents si possible, et une estimation honnête de CAC, LTV et délai de rentabilité",
  },
  en: {
    tech: "a proven, justified stack, a simple MVP architecture, named technical risks with a plan to remove them, and a team whose experience covers what must be built",
    market: "a bottom-up market size (number of buyers × price), a source for every figure, a precise beachhead segment and an expansion segment",
    goToMarket: "a precise ideal customer (who they are, their situation, what makes them look for a solution), one or two acquisition channels that can be tested on a budget, and an advantage competitors cannot easily copy",
    scalability: "what stays stable at 10× volume: architecture, variable costs, automated operations, controlled external dependencies",
    financial: "a clear price per offer, recurring revenue where possible, and an honest estimate of CAC, LTV and payback period",
  },
};

function dossierBlock(idea: IdeaDossier, lang: PromptLang): string {
  const L = FIELD_LABEL[lang];
  const stage = lang === "fr" ? "Stade" : "Stage";
  return [
    `# ${idea.title}`,
    `${stage}: ${idea.stage}`,
    `${L.description}: ${idea.description}`,
    `${L.marketSizeEstimate}: ${idea.marketSizeEstimate}`,
    `${L.teamSummary}: ${idea.teamSummary}`,
    `${L.techStack}: ${idea.techStack}`,
    `${L.revenueModel}: ${idea.revenueModel}`,
  ].join("\n");
}

function critiques(feedbacks: PanelFeedback[], roles: string[]): string[] {
  const seen = new Set<string>();
  return feedbacks
    .filter((f) => roles.includes(f.role))
    .flatMap((f) => f.weaknesses.map((w) => `${w} (${f.role})`))
    .filter((w) => (seen.has(w) ? false : (seen.add(w), true)));
}

function dimensionPrompt(dim: DimensionKey, score: number, idea: IdeaDossier, feedbacks: PanelFeedback[], lang: PromptLang): CoachPrompt {
  const fields = DIMENSION_FIELDS[dim];
  const L = FIELD_LABEL[lang];
  const fieldList = fields.map((f) => `"${L[f]}"`).join(lang === "fr" ? " et " : " and ");
  const issues = critiques(feedbacks, DIMENSION_ROLES[dim]);
  const issueBlock = issues.length ? issues.map((i) => `- ${i}`).join("\n") : lang === "fr" ? "- (aucune critique explicite : vise simplement plus de précision)" : "- (no explicit critique: aim for more precision)";

  const text =
    lang === "fr"
      ? `Tu es un associé de fonds d'amorçage qui coache des fondateurs avant leur levée.

Mon projet a obtenu ${score}/100 sur la dimension « ${DIM_LABEL.fr[dim]} » lors d'un stress test par un panel (investisseur, CTO, marketing, opérations). Voici mon dossier actuel :

${dossierBlock(idea, "fr")}

Critiques du panel sur cette dimension :
${issueBlock}

Objectif : que la dimension « ${DIM_LABEL.fr[dim]} » montre ${GOAL.fr[dim]}.

Méthode :
1. Pose-moi d'abord 3 à 5 questions précises pour obtenir les faits qui manquent. N'invente jamais de chiffres, de clients ou d'expérience : si une information manque, demande-la ou indique clairement « à valider ».
2. Une fois mes réponses reçues, réécris uniquement le(s) champ(s) ${fieldList}, prêts à coller dans le formulaire. Reste concret et chiffré. Longueur maximale en caractères : ${limits(fields, "fr")}.
3. Termine par une ligne par critique du panel, expliquant comment la nouvelle version y répond.`
      : `You are a seed-stage VC partner who coaches founders before they raise.

My project scored ${score}/100 on "${DIM_LABEL.en[dim]}" in a stress test by a panel (investor, CTO, marketing, operations). Here is my current dossier:

${dossierBlock(idea, "en")}

Panel critiques on this dimension:
${issueBlock}

Goal: make "${DIM_LABEL.en[dim]}" show ${GOAL.en[dim]}.

Method:
1. First ask me 3–5 precise questions to get the facts that are missing. Never invent numbers, customers or experience: if something is missing, ask for it or mark it clearly as "to validate".
2. Once I answer, rewrite only the ${fieldList} field(s), ready to paste into the form. Be concrete and quantified. Maximum length in characters: ${limits(fields, "en")}.
3. End with one line per panel critique explaining how the new version addresses it.`;

  return {
    id: dim,
    dimension: dim,
    score,
    title: lang === "fr" ? `Renforcer « ${DIM_LABEL.fr[dim]} »` : `Strengthen ${DIM_LABEL.en[dim]}`,
    fields,
    text,
  };
}

const ALL_FIELDS: IdeaField[] = ["description", "marketSizeEstimate", "teamSummary", "techStack", "revenueModel"];

function fullRewritePrompt(idea: IdeaDossier, overall: number, scores: Scores, feedbacks: PanelFeedback[], lang: PromptLang): CoachPrompt {
  const allIssues = feedbacks.flatMap((f) => f.weaknesses.map((w) => `- ${w} (${f.role}, ${f.score}/100)`));
  const scoreLine = (Object.keys(scores) as DimensionKey[]).map((k) => `${DIM_LABEL[lang][k]} ${scores[k]}`).join(" · ");

  const text =
    lang === "fr"
      ? `Tu es un associé de fonds d'amorçage. Aide-moi à transformer ce dossier de startup en un dossier qu'un investisseur prendrait au sérieux.

Score global actuel : ${overall}/100 (${scoreLine}).

${dossierBlock(idea, "fr")}

Toutes les critiques du panel :
${allIssues.join("\n") || "- aucune"}

Déroulé :
1. Classe les critiques de la plus coûteuse à la moins coûteuse pour une levée, en une ligne chacune.
2. Pose-moi les questions nécessaires pour y répondre (maximum 8, regroupées par thème). N'invente aucun fait.
3. Avec mes réponses, réécris les champs Description, Taille du marché, Équipe, Stack technique et Modèle économique. Chaque champ doit être prêt à coller, avec ces longueurs maximales en caractères : ${limits(ALL_FIELDS, "fr")}.
4. Signale ce qui reste « à valider » avant de pitcher.`
      : `You are a seed-stage VC partner. Help me turn this startup dossier into one an investor would take seriously.

Current overall score: ${overall}/100 (${scoreLine}).

${dossierBlock(idea, "en")}

All panel critiques:
${allIssues.join("\n") || "- none"}

Process:
1. Rank the critiques from most to least damaging for a raise, one line each.
2. Ask me the questions needed to address them (8 max, grouped by theme). Do not invent any fact.
3. With my answers, rewrite the Description, Market size, Team, Tech stack and Revenue model fields, ready to paste, within these character limits: ${limits(ALL_FIELDS, "en")}.
4. Flag what is still "to validate" before pitching.`;

  return {
    id: "all",
    dimension: "all",
    score: overall,
    title: lang === "fr" ? "Réécrire tout le dossier" : "Rewrite the whole dossier",
    fields: ALL_FIELDS,
    text,
  };
}

/** The three weakest dimensions (below 80), then a whole-dossier rewrite. */
export function buildCoachPrompts(
  idea: IdeaDossier,
  overall: number,
  scores: Scores,
  feedbacks: PanelFeedback[],
  lang: PromptLang
): CoachPrompt[] {
  const weakest = (Object.keys(scores) as DimensionKey[])
    .filter((k) => scores[k] < 80)
    .sort((a, b) => scores[a] - scores[b])
    .slice(0, 3);
  return [
    ...weakest.map((d) => dimensionPrompt(d, scores[d], idea, feedbacks, lang)),
    fullRewritePrompt(idea, overall, scores, feedbacks, lang),
  ];
}

export function fieldLabel(field: IdeaField, lang: PromptLang): string {
  return FIELD_LABEL[lang][field];
}
