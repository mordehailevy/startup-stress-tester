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

  if (marketHits > 0) { score += marketHits * 8; strengths.push("Potentially large addressable market"); }
  if (smallHits > 0) { score -= smallHits * 6; weaknesses.push("Market appears limited or niche"); }

  // Revenue model clarity
  const revenueKw = ["subscription", "saas", "commission", "freemium", "marketplace", "b2b", "recurring", "abonnement"];
  const revenueHits = hasKeywords(idea.revenueModel, revenueKw);
  if (revenueHits >= 2) { score += 12; strengths.push("Clear, scalable revenue model"); }
  else if (revenueHits === 1) { score += 5; strengths.push("Revenue model identified"); }
  else { score -= 8; weaknesses.push("Revenue model unclear or unproven"); }

  // Team
  const teamKw = ["senior", "cto", "ceo", "co-founder", "experience", "engineer", "marketing", "sales"];
  if (hasKeywords(idea.teamSummary, teamKw) >= 2) { score += 10; strengths.push("Experienced team composition"); }
  else { score -= 5; weaknesses.push("Team experience not clearly demonstrated"); }

  // Description depth
  if (wordCount(idea.description) >= 60) { score += 6; strengths.push("Well-articulated value proposition"); }
  else { score -= 4; weaknesses.push("Description could be more detailed"); }

  // Stage bonus
  score = score * (STAGE_MULTIPLIER[idea.stage] || 1);

  return {
    role: "Venture Capital Investor",
    summary: `From an investment perspective, this startup ${score >= 65 ? "shows promise" : "needs more validation"} for funding consideration.`,
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

  if (mature >= 3) { score += 15; strengths.push("Solid, battle-tested technology stack"); }
  else if (mature >= 1) { score += 7; strengths.push("Reasonable technology choices"); }
  else { score -= 10; weaknesses.push("Technology stack not clearly defined"); }

  if (risky > 0) { score -= 5; weaknesses.push("Includes emerging/unproven technologies — higher execution risk"); }

  // Scalability signals
  const scaleKw = ["micro-services", "microservices", "api", "cloud", "serverless", "scalable", "cache", "redis", "cdn"];
  if (hasKeywords(idea.techStack + " " + idea.description, scaleKw) >= 2) {
    score += 10; strengths.push("Architecture appears scalable");
  }

  // Complexity vs team size
  const complexKw = ["machine learning", "ml", "ai", "real-time", "video", "streaming", "blockchain"];
  const complexity = hasKeywords(idea.description + " " + idea.techStack, complexKw);
  const teamWords = wordCount(idea.teamSummary);
  if (complexity >= 2 && teamWords < 20) {
    score -= 10; weaknesses.push("High technical complexity with seemingly small team");
  }

  // Description technical depth
  if (wordCount(idea.description) >= 80) { score += 5; strengths.push("Detailed technical vision"); }

  score = score * (STAGE_MULTIPLIER[idea.stage] || 1);

  return {
    role: "CTO / Tech Lead",
    summary: `Technically, the project ${score >= 65 ? "is feasible and well-structured" : "presents execution challenges that need addressing"}.`,
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
  const gtmKw = ["seo", "content", "social", "influencer", "viral", "community", "referral", "ads", "growth", "organic", "partnership", "b2b", "b2c", "inbound"];
  const gtmHits = hasKeywords(idea.description + " " + idea.revenueModel, gtmKw);
  if (gtmHits >= 3) { score += 15; strengths.push("Strong go-to-market strategy signals"); }
  else if (gtmHits >= 1) { score += 6; strengths.push("Some acquisition channels identified"); }
  else { score -= 10; weaknesses.push("No clear customer acquisition strategy"); }

  // Target audience clarity
  const audienceKw = ["developers", "entreprises", "consumers", "students", "freelancers", "smb", "enterprise", "startups", "creators"];
  if (hasKeywords(idea.description + " " + idea.marketSizeEstimate, audienceKw) >= 1) {
    score += 8; strengths.push("Target audience identified");
  } else {
    score -= 6; weaknesses.push("Target audience not clearly defined");
  }

  // Competitive differentiation
  const diffKw = ["unique", "first", "only", "innovative", "patent", "proprietary", "moat", "advantage"];
  if (hasKeywords(idea.description, diffKw) >= 1) {
    score += 10; strengths.push("Claims competitive differentiation");
  } else {
    score -= 4; weaknesses.push("Competitive advantage not clearly articulated");
  }

  // Brand potential (title quality)
  if (idea.title.length <= 30 && idea.title.length >= 3) { score += 3; strengths.push("Concise, memorable project name"); }

  score = score * (STAGE_MULTIPLIER[idea.stage] || 1);

  return {
    role: "Marketing Strategist",
    summary: `From a market positioning standpoint, ${score >= 65 ? "the startup has identifiable traction levers" : "more work is needed on go-to-market strategy"}.`,
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
  const physicalKw = ["hardware", "shipping", "inventory", "logistics", "warehouse", "manufacturing", "physical"];
  const digitalKw = ["saas", "software", "digital", "platform", "app", "api", "cloud"];
  const physical = hasKeywords(idea.description + " " + idea.techStack, physicalKw);
  const digital = hasKeywords(idea.description + " " + idea.techStack, digitalKw);

  if (digital >= 2 && physical === 0) { score += 12; strengths.push("Pure digital model — low operational overhead"); }
  else if (physical >= 2) { score -= 10; weaknesses.push("Physical operations add complexity and capital requirements"); }

  // Revenue predictability
  const recurringKw = ["subscription", "saas", "recurring", "monthly", "annual", "abonnement"];
  if (hasKeywords(idea.revenueModel, recurringKw) >= 1) { score += 10; strengths.push("Recurring revenue model supports operational planning"); }

  // Cost structure
  const costKw = ["low cost", "lean", "bootstrap", "minimal", "efficient", "automated"];
  if (hasKeywords(idea.description + " " + idea.revenueModel, costKw) >= 1) {
    score += 7; strengths.push("Lean cost structure indicated");
  }

  // Dependencies / risk
  const depKw = ["third-party", "dependency", "single supplier", "regulated", "compliance", "legal"];
  if (hasKeywords(idea.description, depKw) >= 1) {
    score -= 6; weaknesses.push("External dependencies or regulatory complexity detected");
  }

  score = score * (STAGE_MULTIPLIER[idea.stage] || 1);

  return {
    role: "Operations & Supply Analyst",
    summary: `Operationally, ${score >= 65 ? "the model is sustainable and scalable" : "there are concerns about execution cost and complexity"}.`,
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
      risks.push({ title: w, reason: `Identified by ${fb.role}`, severity, role: fb.role });
    }
  }
  // Sort by severity
  const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  risks.sort((a, b) => order[a.severity] - order[b.severity]);
  return risks;
}

/** Concrete next action for each known weakness (rule-based mode). */
const ACTIONS: Record<string, string> = {
  "Market appears limited or niche": "Size the market bottom-up (buyers × price) and name an adjacent segment you could expand into",
  "Revenue model unclear or unproven": "Pick one pricing model and validate willingness to pay with 10 pre-sales or LOIs",
  "Team experience not clearly demonstrated": "Add an advisor or co-founder with direct domain experience and highlight it in the pitch",
  "Description could be more detailed": "Rewrite the description as problem → who suffers → your solution → why now",
  "Technology stack not clearly defined": "Choose a boring, proven stack for the MVP and document the core architecture on one page",
  "Includes emerging/unproven technologies — higher execution risk": "Isolate the unproven tech behind a spike and prove it works before building around it",
  "High technical complexity with seemingly small team": "Cut scope to the single feature that proves the value; postpone integrations and ML",
  "No clear customer acquisition strategy": "Pick one acquisition channel and run a 2-week test with a fixed small budget",
  "Target audience not clearly defined": "Write an ideal-customer profile (role, company size, trigger event) and interview 15 of them",
  "Competitive advantage not clearly articulated": "Map 3–5 competitors and state in one sentence what you do that they cannot easily copy",
  "Physical operations add complexity and capital requirements": "Start with a partner or marketplace model to avoid owning physical operations early",
  "External dependencies or regulatory complexity detected": "List required licences and third-party APIs, and get a compliance opinion before launch",
};

function collectRecommendations(feedbacks: PanelistFeedback[]): Recommendation[] {
  const seen = new Set<string>();
  const recs: Recommendation[] = [];
  for (const fb of feedbacks) {
    for (const w of fb.weaknesses) {
      const text = ACTIONS[w] ?? `Address this weakness: ${w.toLowerCase()}`;
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
  const steps: string[] = [];
  steps.push(`Validate core hypothesis: "${idea.title}" solves a real pain point via customer interviews (min 20)`);
  if (scores.goToMarket < 60) steps.push("Define a clear go-to-market channel and test with a small budget ($500-$1k)");
  if (scores.tech < 60) steps.push("Build a minimal technical proof of concept to de-risk the architecture");
  steps.push("Launch a landing page with waitlist to gauge demand");
  if (scores.financial < 60) steps.push("Create a unit economics model (CAC, LTV, payback period)");
  steps.push("Ship a bare-bones MVP to first 50 beta users and iterate on feedback");
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

/**
 * Turns the first sentence of the description into a clause that reads after
 * the venture name: "that helps SMBs track…" or "— an AI tutor that…".
 */
function valueProposition(description: string): string {
  const first = (description.split(/(?<=[.!?])\s/)[0] ?? description).trim();
  const m = first.match(/^(?:an?|the)?\s*(?:[\w-]+\s+){0,3}?(?:platform|app|application|tool|service|marketplace|solution)\s+(?:that|which)\s+(.*)$/i);
  if (m) return `that ${clip(m[1], 140)}`;
  return `— ${clip(first.charAt(0).toLowerCase() + first.slice(1), 140)}`;
}

function generateShortPitch(idea: IdeaInput, overall: number): string {
  const name = idea.title.split(/\s+[—–-]\s+/)[0].trim();
  const strength = overall >= 70 ? "compelling" : overall >= 50 ? "promising" : "early-stage";
  const stage = idea.stage === "mvp" ? "MVP" : idea.stage;
  const article = /^[aeiou]/i.test(strength) ? "an" : "a";
  const sentence = (t: string) => (/[.!?…]$/.test(t) ? t : `${t}.`);
  return [
    sentence(`${name} is ${article} ${idea.stage === "idea" ? `${strength} idea` : `${strength} ${stage}-stage venture`} ${valueProposition(idea.description)}`),
    sentence(`Market: ${clip(idea.marketSizeEstimate, 90)}`),
    sentence(`Business model: ${clip(idea.revenueModel, 90)}`),
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
