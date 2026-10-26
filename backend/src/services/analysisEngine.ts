import { IIdea } from "../models/Idea";
import {
  Scores,
  Risk,
  Recommendation,
  PanelistFeedback,
} from "../models/Analysis";

// ── Types ───────────────────────────────────────
export interface AnalysisResult {
  overallScore: number;
  scores: Scores;
  risks: Risk[];
  recommendations: Recommendation[];
  panelistFeedbacks: PanelistFeedback[];
  mvpSteps: string[];
  shortPitch: string;
  verdict: "strong" | "promising" | "needs-work" | "weak";
}

interface IdeaInput {
  title: string;
  description: string;
  marketSizeEstimate: string;
  teamSummary: string;
  techStack: string;
  revenueModel: string;
  stage: string;
}

// ── Helpers ─────────────────────────────────────
/** French display names for the panel roles (role strings stay as stable English IDs). */
const ROLE_FR: Record<string, string> = {
  "Venture Capital Investor": "Investisseur",
  "CTO / Tech Lead": "CTO",
  "Marketing Strategist": "Stratège marketing",
  "Operations & Supply Analyst": "Analyste opérations",
};

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function hasKeywords(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  return keywords.filter((kw) => lower.includes(kw.toLowerCase())).length;
}

// ── Stage multiplier (more advanced = higher baseline) ──
const STAGE_MULTIPLIER: Record<string, number> = {
  idea: 0.7,
  prototype: 0.85,
  mvp: 1.0,
  growth: 1.1,
  scale: 1.15,
};

// ═══════════════════════════════════════════════════
//  PANELIST 1 — Venture Capital Investor (VC)
// ═══════════════════════════════════════════════════
function evaluateAsInvestor(idea: IdeaInput): PanelistFeedback {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  let score = 50;

  // Market size signal words
  const bigMarketKw = ["billion", "milliard", "global", "mondial", "massive", "large", "huge"];
  const smallMarketKw = ["niche", "local", "petit", "small", "limited"];
  const marketHits = hasKeywords(idea.marketSizeEstimate + " " + idea.description, bigMarketKw);
  const smallHits = hasKeywords(idea.marketSizeEstimate + " " + idea.description, smallMarketKw);

  if (marketHits > 0) { score += marketHits * 8; strengths.push("Marché adressable potentiellement large"); }
  if (smallHits > 0) { score -= smallHits * 6; weaknesses.push("Marché qui semble limité ou de niche"); }

  // Revenue model clarity
  const revenueKw = ["subscription", "saas", "commission", "freemium", "marketplace", "b2b", "recurring", "abonnement", "récurrent", "licence"];
  const revenueHits = hasKeywords(idea.revenueModel, revenueKw);
  if (revenueHits >= 2) { score += 12; strengths.push("Modèle économique clair et scalable"); }
  else if (revenueHits === 1) { score += 5; strengths.push("Modèle économique identifié"); }
  else { score -= 8; weaknesses.push("Modèle économique flou ou non prouvé"); }

  // Team
  const teamKw = ["senior", "cto", "ceo", "co-founder", "experience", "engineer", "marketing", "sales", "cofondateur", "co-fondateur", "expérience", "ingénieur", "ventes", "ans d'expérience"];
  if (hasKeywords(idea.teamSummary, teamKw) >= 2) { score += 10; strengths.push("Équipe expérimentée"); }
  else { score -= 5; weaknesses.push("Expérience de l'équipe pas clairement démontrée"); }

  // Description depth
  if (wordCount(idea.description) >= 60) { score += 6; strengths.push("Proposition de valeur bien formulée"); }
  else { score -= 4; weaknesses.push("Description pas assez détaillée"); }

  // Stage bonus
  score = score * (STAGE_MULTIPLIER[idea.stage] || 1);

  return {
    role: "Venture Capital Investor",
    summary: `Du point de vue d'un investisseur, ce projet ${score >= 65 ? "est prometteur pour une levée" : "a besoin de plus de validation avant une levée"}.`,
    score: clamp(score),
    strengths,
    weaknesses,
  };
}

// ═══════════════════════════════════════════════════
//  PANELIST 2 — CTO / Tech Lead
// ═══════════════════════════════════════════════════
function evaluateAsCTO(idea: IdeaInput): PanelistFeedback {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  let score = 50;

  // Tech stack maturity
  const matureTech = ["react", "node", "python", "django", "typescript", "postgresql", "mongodb", "docker", "kubernetes", "aws", "gcp", "azure", "flutter", "swift"];
  const riskyTech = ["blockchain", "web3", "quantum", "ar/vr"];
  const mature = hasKeywords(idea.techStack, matureTech);
  const risky = hasKeywords(idea.techStack, riskyTech);

  if (mature >= 3) { score += 15; strengths.push("Stack technique solide et éprouvée"); }
  else if (mature >= 1) { score += 7; strengths.push("Choix techniques raisonnables"); }
  else { score -= 10; weaknesses.push("Stack technique pas clairement définie"); }

  if (risky > 0) { score -= 5; weaknesses.push("Technologies émergentes ou non éprouvées : risque d'exécution plus élevé"); }

  // Scalability signals
  const scaleKw = ["micro-services", "microservices", "api", "cloud", "serverless", "scalable", "cache", "redis", "cdn", "scalabilité"];
  if (hasKeywords(idea.techStack + " " + idea.description, scaleKw) >= 2) {
    score += 10; strengths.push("Architecture qui semble scalable");
  }

  // Complexity vs team size
  const complexKw = ["machine learning", "ml", "ai", "real-time", "video", "streaming", "blockchain", "ia", "temps réel", "vidéo"];
  const complexity = hasKeywords(idea.description + " " + idea.techStack, complexKw);
  const teamWords = wordCount(idea.teamSummary);
  if (complexity >= 2 && teamWords < 20) {
    score -= 10; weaknesses.push("Forte complexité technique pour une équipe qui semble petite");
  }

  // Description technical depth
  if (wordCount(idea.description) >= 80) { score += 5; strengths.push("Vision technique détaillée"); }

  score = score * (STAGE_MULTIPLIER[idea.stage] || 1);

  return {
    role: "CTO / Tech Lead",
    summary: `Techniquement, le projet ${score >= 65 ? "est faisable et bien structuré" : "présente des défis d'exécution à traiter"}.`,
    score: clamp(score),
    strengths,
    weaknesses,
  };
}

// ═══════════════════════════════════════════════════
//  PANELIST 3 — Marketing Strategist
// ═══════════════════════════════════════════════════
function evaluateAsMarketer(idea: IdeaInput): PanelistFeedback {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  let score = 50;

  // Go-to-market signals
  const gtmKw = ["seo", "content", "social", "influencer", "viral", "community", "referral", "ads", "growth", "organic", "partnership", "b2b", "b2c", "inbound", "contenu", "réseaux sociaux", "influenceur", "communauté", "parrainage", "publicité", "partenariat", "salons", "prospection"];
  const gtmHits = hasKeywords(idea.description + " " + idea.revenueModel, gtmKw);
  if (gtmHits >= 3) { score += 15; strengths.push("Stratégie go-to-market solide"); }
  else if (gtmHits >= 1) { score += 6; strengths.push("Quelques canaux d'acquisition identifiés"); }
  else { score -= 10; weaknesses.push("Pas de stratégie claire d'acquisition clients"); }

  // Target audience clarity
  const audienceKw = ["developers", "entreprises", "consumers", "students", "freelancers", "smb", "enterprise", "startups", "creators", "développeurs", "particuliers", "étudiants", "indépendants", "pme", "tpe", "créateurs", "artisans", "familles", "professionnels"];
  if (hasKeywords(idea.description + " " + idea.marketSizeEstimate, audienceKw) >= 1) {
    score += 8; strengths.push("Public cible identifié");
  } else {
    score -= 6; weaknesses.push("Public cible pas clairement défini");
  }

  // Competitive differentiation
  const diffKw = ["unique", "first", "only", "innovative", "patent", "proprietary", "moat", "advantage", "premier", "seul", "innovant", "brevet", "propriétaire", "avantage", "contrairement"];
  if (hasKeywords(idea.description, diffKw) >= 1) {
    score += 10; strengths.push("Différenciation concurrentielle revendiquée");
  } else {
    score -= 4; weaknesses.push("Avantage concurrentiel pas clairement formulé");
  }

  // Brand potential (title quality)
  if (idea.title.length <= 30 && idea.title.length >= 3) { score += 3; strengths.push("Nom de projet court et mémorable"); }

  score = score * (STAGE_MULTIPLIER[idea.stage] || 1);

  return {
    role: "Marketing Strategist",
    summary: `Côté positionnement, ${score >= 65 ? "le projet a des leviers de traction identifiables" : "la stratégie go-to-market reste à travailler"}.`,
    score: clamp(score),
    strengths,
    weaknesses,
  };
}

// ═══════════════════════════════════════════════════
//  PANELIST 4 — Supply Chain / Operations Analyst
// ═══════════════════════════════════════════════════
function evaluateAsSupplier(idea: IdeaInput): PanelistFeedback {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  let score = 55;

  // Operational complexity
  const physicalKw = ["hardware", "shipping", "inventory", "logistics", "warehouse", "manufacturing", "physical", "matériel", "livraison", "stock", "logistique", "entrepôt", "fabrication", "physique"];
  const digitalKw = ["saas", "software", "digital", "platform", "app", "api", "cloud", "logiciel", "numérique", "plateforme", "application"];
  const physical = hasKeywords(idea.description + " " + idea.techStack, physicalKw);
  const digital = hasKeywords(idea.description + " " + idea.techStack, digitalKw);

  if (digital >= 2 && physical === 0) { score += 12; strengths.push("Modèle 100 % numérique : peu de charges opérationnelles"); }
  else if (physical >= 2) { score -= 10; weaknesses.push("Les opérations physiques ajoutent complexité et besoins en capital"); }

  // Revenue predictability
  const recurringKw = ["subscription", "saas", "recurring", "monthly", "annual", "abonnement", "mensuel", "annuel", "récurrent"];
  if (hasKeywords(idea.revenueModel, recurringKw) >= 1) { score += 10; strengths.push("Revenus récurrents qui facilitent la planification"); }

  // Cost structure
  const costKw = ["low cost", "lean", "bootstrap", "minimal", "efficient", "automated", "faible coût", "automatisé", "léger"];
  if (hasKeywords(idea.description + " " + idea.revenueModel, costKw) >= 1) {
    score += 7; strengths.push("Structure de coûts légère");
  }

  // Dependencies / risk
  const depKw = ["third-party", "dependency", "single supplier", "regulated", "compliance", "legal", "tiers", "dépendance", "fournisseur unique", "réglementé", "conformité", "juridique"];
  if (hasKeywords(idea.description, depKw) >= 1) {
    score -= 6; weaknesses.push("Dépendances externes ou complexité réglementaire détectées");
  }

  score = score * (STAGE_MULTIPLIER[idea.stage] || 1);

  return {
    role: "Operations & Supply Analyst",
    summary: `Sur le plan opérationnel, ${score >= 65 ? "le modèle est soutenable et peut grandir" : "le coût et la complexité d'exécution inquiètent"}.`,
    score: clamp(score),
    strengths,
    weaknesses,
  };
}

// ═══════════════════════════════════════════════════
//  ORCHESTRATOR — Aggregate all panelists
// ═══════════════════════════════════════════════════
function aggregateScores(feedbacks: PanelistFeedback[]): Scores {
  const investor = feedbacks.find((f) => f.role === "Venture Capital Investor")!;
  const cto = feedbacks.find((f) => f.role === "CTO / Tech Lead")!;
  const marketer = feedbacks.find((f) => f.role === "Marketing Strategist")!;
  const ops = feedbacks.find((f) => f.role === "Operations & Supply Analyst")!;

  return {
    tech: cto.score,
    market: clamp((investor.score * 0.5 + marketer.score * 0.5)),
    goToMarket: marketer.score,
    scalability: clamp((cto.score * 0.4 + ops.score * 0.6)),
    financial: clamp((investor.score * 0.6 + ops.score * 0.4)),
  };
}

function computeOverall(scores: Scores): number {
  const weights = { tech: 0.2, market: 0.25, goToMarket: 0.2, scalability: 0.15, financial: 0.2 };
  const total =
    scores.tech * weights.tech +
    scores.market * weights.market +
    scores.goToMarket * weights.goToMarket +
    scores.scalability * weights.scalability +
    scores.financial * weights.financial;
  return clamp(total);
}

function deriveVerdict(overall: number): "strong" | "promising" | "needs-work" | "weak" {
  if (overall >= 75) return "strong";
  if (overall >= 55) return "promising";
  if (overall >= 35) return "needs-work";
  return "weak";
}

function collectRisks(feedbacks: PanelistFeedback[]): Risk[] {
  const risks: Risk[] = [];
  for (const fb of feedbacks) {
    for (const w of fb.weaknesses) {
      const severity: Risk["severity"] =
        fb.score < 40 ? "critical" : fb.score < 55 ? "high" : fb.score < 70 ? "medium" : "low";
      risks.push({ title: w, reason: `Relevé par : ${ROLE_FR[fb.role] ?? fb.role}`, severity, role: fb.role });
    }
  }
  // Sort by severity
  const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  risks.sort((a, b) => order[a.severity] - order[b.severity]);
  return risks;
}

/** Concrete next action for each known weakness (rule-based mode). */
const ACTIONS: Record<string, string> = {
  "Marché qui semble limité ou de niche": "Calcule le marché de bas en haut (nombre d'acheteurs × prix) et nomme un segment voisin où t'étendre",
  "Modèle économique flou ou non prouvé": "Choisis un seul modèle de prix et valide la disposition à payer avec 10 préventes ou lettres d'intention",
  "Expérience de l'équipe pas clairement démontrée": "Ajoute un mentor ou un cofondateur expert du domaine et mets-le en avant dans le pitch",
  "Description pas assez détaillée": "Réécris la description ainsi : problème → qui en souffre → ta solution → pourquoi maintenant",
  "Stack technique pas clairement définie": "Choisis une stack éprouvée pour le MVP et décris l'architecture sur une page",
  "Technologies émergentes ou non éprouvées : risque d'exécution plus élevé": "Isole la techno non éprouvée dans un prototype et prouve qu'elle marche avant de construire autour",
  "Forte complexité technique pour une équipe qui semble petite": "Réduis le périmètre à la seule fonctionnalité qui prouve la valeur ; reporte intégrations et IA",
  "Pas de stratégie claire d'acquisition clients": "Choisis un canal d'acquisition et teste-le 2 semaines avec un petit budget fixe",
  "Public cible pas clairement défini": "Rédige le profil de ton client idéal (qui, situation, déclencheur) et interroge-en 15",
  "Avantage concurrentiel pas clairement formulé": "Liste 3 à 5 concurrents et dis en une phrase ce que tu fais qu'ils ne peuvent pas copier facilement",
  "Les opérations physiques ajoutent complexité et besoins en capital": "Commence avec des partenaires ou une marketplace pour ne pas porter la logistique au début",
  "Dépendances externes ou complexité réglementaire détectées": "Liste les licences et API tierces nécessaires et fais valider la conformité avant le lancement",
};

function collectRecommendations(feedbacks: PanelistFeedback[]): Recommendation[] {
  const seen = new Set<string>();
  const recs: Recommendation[] = [];
  for (const fb of feedbacks) {
    for (const w of fb.weaknesses) {
      const text = ACTIONS[w] ?? `À corriger : ${w.charAt(0).toLowerCase()}${w.slice(1)}`;
      if (seen.has(text)) continue;
      seen.add(text);
      const priority: Recommendation["priority"] = fb.score < 50 ? "high" : fb.score < 70 ? "medium" : "low";
      recs.push({ text, priority, role: fb.role });
    }
  }
  const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
  recs.sort((a, b) => order[a.priority] - order[b.priority]);
  return recs.slice(0, 6);
}

function generateMVPSteps(idea: IdeaInput, scores: Scores): string[] {
  const name = shortName(idea.title);
  const steps: string[] = [];
  steps.push(`Valider l'hypothèse de départ : ${name} résout-il un vrai problème ? Mène au moins 20 entretiens clients`);
  if (scores.goToMarket < 60) steps.push("Choisir un canal d'acquisition et le tester avec un petit budget (500 à 1 000 €)");
  if (scores.tech < 60) steps.push("Construire une preuve de concept technique minimale pour lever le risque d'architecture");
  steps.push("Lancer une page d'atterrissage avec liste d'attente pour mesurer la demande");
  if (scores.financial < 60) steps.push("Construire un modèle d'unit economics (CAC, LTV, délai de rentabilité)");
  steps.push("Livrer un MVP minimal à 50 premiers bêta-testeurs et itérer sur leurs retours");
  return steps.slice(0, 5);
}

/** Shortens text at a word boundary, without cutting mid-word. */
function clip(text: string, max: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t.replace(/[.\s]+$/, "");
  const cut = t.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.\s]+$/, "") + "…";
}

/** "EcoTrack — Carbon Tracker" → "EcoTrack". */
function shortName(title: string): string {
  return title.split(/\s+[—–-]\s+/)[0].trim();
}

/**
 * Turns the first sentence of the description into a clause that reads after
 * the venture name: "qui aide les PME…" / "— une application…".
 */
function valueProposition(description: string): string {
  const first = (description.split(/(?<=[.!?])\s/)[0] ?? description).trim();
  const fr = first.match(/^(?:une?|la|le|l')?\s*(?:[\p{L}-]+\s+){0,3}?(?:plateforme|application|appli|outil|service|marketplace|solution|logiciel)\s+(?:qui|permettant)\s+(.*)$/iu);
  if (fr) return `qui ${clip(fr[1].replace(/^de\s+/i, ""), 140)}`;
  const en = first.match(/^(?:an?|the)?\s*(?:[\w-]+\s+){0,3}?(?:platform|app|application|tool|service|marketplace|solution)\s+(?:that|which)\s+(.*)$/i);
  if (en) return `— ${clip(en[1], 140)}`;
  return `— ${clip(first.charAt(0).toLowerCase() + first.slice(1), 140)}`;
}

const STAGE_FR: Record<string, string> = { idea: "au stade de l'idée", prototype: "au stade prototype", mvp: "au stade MVP", growth: "en croissance", scale: "en phase d'expansion" };

function generateShortPitch(idea: IdeaInput, overall: number): string {
  const strength = overall >= 70 ? "solide" : overall >= 50 ? "prometteur" : "encore fragile";
  const sentence = (t: string) => (/[.!?…]$/.test(t) ? t : `${t}.`);
  const vp = valueProposition(idea.description);
  return [
    sentence(`${shortName(idea.title)} est un projet ${strength}, ${STAGE_FR[idea.stage] ?? idea.stage}${vp.startsWith("qui") ? ", " : " "}${vp}`),
    sentence(`Marché : ${clip(idea.marketSizeEstimate, 90)}`),
    sentence(`Modèle économique : ${clip(idea.revenueModel, 90)}`),
  ].join(" ");
}

// ═══════════════════════════════════════════════════
//  PUBLIC API
// ═══════════════════════════════════════════════════
export function analyzeIdea(idea: IdeaInput | IIdea): AnalysisResult {
  const input: IdeaInput = {
    title: idea.title,
    description: idea.description,
    marketSizeEstimate: idea.marketSizeEstimate,
    teamSummary: idea.teamSummary,
    techStack: idea.techStack,
    revenueModel: idea.revenueModel,
    stage: idea.stage,
  };

  // Run all four panelists
  const panelistFeedbacks: PanelistFeedback[] = [
    evaluateAsInvestor(input),
    evaluateAsCTO(input),
    evaluateAsMarketer(input),
    evaluateAsSupplier(input),
  ];

  const scores = aggregateScores(panelistFeedbacks);
  const overallScore = computeOverall(scores);
  const verdict = deriveVerdict(overallScore);
  const risks = collectRisks(panelistFeedbacks);
  const recommendations = collectRecommendations(panelistFeedbacks);
  const mvpSteps = generateMVPSteps(input, scores);
  const shortPitch = generateShortPitch(input, overallScore);

  return {
    overallScore,
    scores,
    risks,
    recommendations,
    panelistFeedbacks,
    mvpSteps,
    shortPitch,
    verdict,
  };
}
