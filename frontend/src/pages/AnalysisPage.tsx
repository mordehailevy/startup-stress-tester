import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { analysesAPI, ideasAPI } from "../services/api";
import { Loader2, ArrowLeft, AlertTriangle, CheckCircle2, Printer, GitCompareArrows } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";
import ScoreDial from "../components/ScoreDial";
import ImprovementPrompts from "../components/ImprovementPrompts";
import type { IdeaDossier } from "../lib/coachPrompts";
import { DIMENSIONS, Scores, scoreHex, scoreText } from "../lib/score";

interface Risk {
  title: string;
  reason: string;
  severity: string;
  role: string;
}

interface Recommendation {
  text: string;
  priority: string;
  role: string;
}

interface PanelistFeedback {
  role: string;
  summary: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
}

export interface Analysis {
  _id: string;
  overallScore: number;
  scores: Scores;
  risks: Risk[];
  recommendations: Recommendation[];
  panelistFeedbacks: PanelistFeedback[];
  mvpSteps: string[];
  shortPitch: string;
  verdict: string;
  engine?: "gemini" | "rules";
  createdAt: string;
  // Populated by the API with the full idea.
  ideaId: { _id: string } & IdeaDossier;
}

const SEVERITY: Record<string, string> = {
  critical: "bg-red-100 text-red-800",
  high: "bg-orange-100 text-orange-800",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-green-100 text-green-800",
};

const PRIORITY: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-gray-100 text-gray-700",
  low: "bg-gray-50 text-gray-500",
};

export default function AnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [previous, setPrevious] = useState<{ _id: string; scores: Scores; overallScore: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    analysesAPI
      .get(id)
      .then(async (res) => {
        const a: Analysis = res.data.data.analysis;
        setAnalysis(a);
        // Find the analysis that came right before this one, to show what changed.
        const list = await ideasAPI.getAnalyses(a.ideaId._id);
        const all: Analysis[] = list.data.data ?? [];
        const older = all
          .filter((x) => new Date(x.createdAt) < new Date(a.createdAt))
          .sort((x, y) => +new Date(y.createdAt) - +new Date(x.createdAt));
        setPrevious(older[0] ?? null);
      })
      .catch(() => setAnalysis(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;
  if (!analysis) {
    return (
      <div className="card mx-auto max-w-md text-center">
        <p className="font-semibold">This report doesn't exist or was deleted.</p>
        <Link to="/" className="btn-secondary mt-4">Go to your ideas</Link>
      </div>
    );
  }

  const radarData = DIMENSIONS.map((d) => ({ subject: d.label, value: analysis.scores[d.key] }));

  return (
    <div className="mx-auto max-w-4xl print:max-w-none">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link to={`/ideas/${analysis.ideaId._id}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600">
          <ArrowLeft className="h-4 w-4" /> Back to {analysis.ideaId.title}
        </Link>
        <div className="flex gap-2">
          {previous && (
            <Link to={`/compare?a=${previous._id}&b=${analysis._id}`} className="btn-secondary gap-1.5 px-3 py-2 text-xs">
              <GitCompareArrows className="h-4 w-4" /> Compare with previous
            </Link>
          )}
          <button onClick={() => window.print()} className="btn-secondary gap-1.5 px-3 py-2 text-xs">
            <Printer className="h-4 w-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* ── Verdict ─────────────────────────────── */}
      <section className="card mb-6 flex flex-col items-center gap-8 p-8 sm:flex-row sm:items-center">
        <ScoreDial score={analysis.overallScore} verdict={analysis.verdict} />
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-4xl">{analysis.ideaId.title}</h1>
          <p className="mt-2 text-sm text-gray-500">
            Stress test of {new Date(analysis.createdAt).toLocaleString()}
            {previous && (
              <>
                {", "}
                <DeltaText delta={analysis.overallScore - previous.overallScore} /> since the previous run
              </>
            )}
          </p>
          <blockquote className="mt-5 border-l-4 border-brand-300 pl-4 text-left text-[15px] leading-relaxed text-gray-700">
            {analysis.shortPitch}
          </blockquote>
          <p className="mt-3 text-xs text-gray-400">
            {analysis.engine === "gemini"
              ? "Scores from the rule-based engine; panel feedback written by Google Gemini."
              : "Scores and feedback from the rule-based engine."}
          </p>
        </div>
      </section>

      {/* ── Dimensions ──────────────────────────── */}
      <section className="card mb-6 break-inside-avoid">
        <h2 className="mb-4 font-display text-xl font-bold">Score by dimension</h2>
        <div className="grid items-center gap-6 md:grid-cols-[1fr_260px]">
          <ul className="space-y-3">
            {DIMENSIONS.map((d) => {
              const v = analysis.scores[d.key];
              return (
                <li key={d.key}>
                  <div className="mb-1 flex items-baseline justify-between text-sm">
                    <span className="font-medium text-gray-700">{d.label}</span>
                    <span className="flex items-baseline gap-2">
                      {previous && <DeltaText delta={v - previous.scores[d.key]} small />}
                      <span className={`font-display text-lg font-bold ${scoreText(v)}`}>{v}</span>
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100" role="presentation">
                    <div className="h-2 rounded-full" style={{ width: `${v}%`, backgroundColor: scoreHex(v) }} />
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="hidden h-60 md:block print:block" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#6b7280" }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar dataKey="value" stroke="#4c6ef5" fill="#4c6ef5" fillOpacity={0.2} strokeWidth={2} isAnimationActive={false} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ── Panel ───────────────────────────────── */}
      <section className="mb-6">
        <h2 className="mb-3 font-display text-xl font-bold">What the panel said</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {analysis.panelistFeedbacks.map((fb) => (
            <article key={fb.role} className="card break-inside-avoid">
              <header className="mb-2 flex items-start justify-between gap-3">
                <h3 className="font-semibold text-gray-900">{fb.role}</h3>
                <span className={`font-display text-2xl font-extrabold leading-none ${scoreText(fb.score)}`}>{fb.score}</span>
              </header>
              <p className="mb-4 text-sm leading-relaxed text-gray-600">{fb.summary}</p>
              {fb.strengths.length > 0 && (
                <ul className="mb-2 space-y-1">
                  {fb.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" aria-label="Strength" /> {s}
                    </li>
                  ))}
                </ul>
              )}
              {fb.weaknesses.length > 0 && (
                <ul className="space-y-1">
                  {fb.weaknesses.map((w, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-700">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-label="Weakness" /> {w}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* ── Risks & actions ─────────────────────── */}
      <div className="mb-6 grid gap-6 md:grid-cols-2">
        <section className="card break-inside-avoid">
          <h2 className="mb-4 font-display text-xl font-bold">Risks</h2>
          {analysis.risks.length === 0 ? (
            <p className="text-sm text-gray-500">The panel flagged no major risk.</p>
          ) : (
            <ul className="space-y-3">
              {analysis.risks.map((r, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className={`mt-0.5 w-16 shrink-0 rounded-full py-0.5 text-center text-[11px] font-semibold ${SEVERITY[r.severity] ?? ""}`}>{r.severity}</span>
                  <span>
                    <span className="block text-sm font-medium text-gray-800">{r.title}</span>
                    <span className="block text-xs text-gray-500">{r.reason}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card break-inside-avoid">
          <h2 className="mb-4 font-display text-xl font-bold">What to do next</h2>
          <ul className="space-y-3">
            {analysis.recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className={`mt-0.5 w-16 shrink-0 rounded-full py-0.5 text-center text-[11px] font-semibold ${PRIORITY[r.priority] ?? ""}`}>{r.priority}</span>
                <span className="text-sm text-gray-700">{r.text}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ── Coaching prompts: turn the critique into a better dossier ── */}
      {analysis.ideaId.description && (
        <ImprovementPrompts
          ideaId={analysis.ideaId._id}
          idea={analysis.ideaId}
          overall={analysis.overallScore}
          scores={analysis.scores}
          feedbacks={analysis.panelistFeedbacks}
        />
      )}

      {/* ── MVP plan (a real sequence, so it's numbered) ── */}
      <section className="card mb-6 break-inside-avoid">
        <h2 className="mb-4 font-display text-xl font-bold">MVP plan</h2>
        <ol className="space-y-3">
          {analysis.mvpSteps.map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 font-display text-xs font-bold text-white">{i + 1}</span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

/** "+6 pts" / "−4 pts" / "no change", coloured by direction. */
export function DeltaText({ delta, small = false }: { delta: number; small?: boolean }) {
  const cls = delta > 0 ? "text-green-600" : delta < 0 ? "text-red-600" : "text-gray-400";
  const text = delta === 0 ? "no change" : `${delta > 0 ? "+" : "−"}${Math.abs(delta)} pts`;
  return <span className={`${cls} ${small ? "text-xs" : "font-medium"}`}>{text}</span>;
}
