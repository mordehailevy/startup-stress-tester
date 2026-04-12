import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { analysesAPI } from "../services/api";
import { Loader2, ArrowLeft, AlertTriangle, CheckCircle2, Lightbulb, Target } from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

interface Scores {
  tech: number;
  market: number;
  goToMarket: number;
  scalability: number;
  financial: number;
}

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

interface Analysis {
  _id: string;
  overallScore: number;
  scores: Scores;
  risks: Risk[];
  recommendations: Recommendation[];
  panelistFeedbacks: PanelistFeedback[];
  mvpSteps: string[];
  shortPitch: string;
  verdict: string;
  createdAt: string;
  ideaId: { _id: string; title: string };
}

export default function AnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    analysesAPI.get(id).then((res) => setAnalysis(res.data.data.analysis)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;
  if (!analysis) return <p>Analysis not found</p>;

  const scoreColor = (score: number) =>
    score >= 70 ? "text-green-600" : score >= 50 ? "text-yellow-600" : "text-red-600";

  const verdictBadge: Record<string, string> = {
    strong: "bg-green-100 text-green-800 border-green-300",
    promising: "bg-blue-100 text-blue-800 border-blue-300",
    "needs-work": "bg-yellow-100 text-yellow-800 border-yellow-300",
    weak: "bg-red-100 text-red-800 border-red-300",
  };

  const sevColor: Record<string, string> = {
    critical: "bg-red-100 text-red-800",
    high: "bg-orange-100 text-orange-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-green-100 text-green-800",
  };

  const radarData = [
    { subject: "Tech", value: analysis.scores.tech },
    { subject: "Market", value: analysis.scores.market },
    { subject: "Go-to-Market", value: analysis.scores.goToMarket },
    { subject: "Scalability", value: analysis.scores.scalability },
    { subject: "Financial", value: analysis.scores.financial },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <Link to={`/ideas/${analysis.ideaId._id}`} className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" /> Back to {analysis.ideaId.title}
      </Link>

      {/* ── Header ──────────────────────────────── */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Stress Test Report</h1>
            <p className="text-sm text-gray-500">{analysis.ideaId.title} — {new Date(analysis.createdAt).toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className={`text-4xl font-extrabold ${scoreColor(analysis.overallScore)}`}>{analysis.overallScore}</div>
              <div className="text-xs text-gray-400">/ 100</div>
            </div>
            <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${verdictBadge[analysis.verdict] || ""}`}>
              {analysis.verdict.replace("-", " ").toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* ── Radar Chart ─────────────────────────── */}
      <div className="card mb-6">
        <h2 className="mb-4 text-lg font-semibold">Score Breakdown</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: "#6b7280" }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar name="Score" dataKey="value" stroke="#4c6ef5" fill="#4c6ef5" fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-sm">
          {radarData.map((d) => (
            <div key={d.subject}>
              <div className={`text-xl font-bold ${scoreColor(d.value)}`}>{d.value}</div>
              <div className="text-xs text-gray-500">{d.subject}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Short Pitch ─────────────────────────── */}
      <div className="card mb-6 bg-brand-50 border-brand-200">
        <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-brand-800">
          <Target className="h-5 w-5" /> Refined Pitch
        </h2>
        <p className="text-brand-900 leading-relaxed">{analysis.shortPitch}</p>
      </div>

      {/* ── Panelist Feedbacks ──────────────────── */}
      <div className="card mb-6">
        <h2 className="mb-4 text-lg font-semibold">AI Panel Feedback</h2>
        <div className="space-y-4">
          {analysis.panelistFeedbacks.map((fb) => (
            <div key={fb.role} className="rounded-lg border border-gray-100 p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold">{fb.role}</h3>
                <span className={`text-lg font-bold ${scoreColor(fb.score)}`}>{fb.score}/100</span>
              </div>
              <p className="mb-3 text-sm text-gray-600">{fb.summary}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {fb.strengths.length > 0 && (
                  <div>
                    <h4 className="mb-1 flex items-center gap-1 text-xs font-semibold text-green-700">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Strengths
                    </h4>
                    <ul className="space-y-1">
                      {fb.strengths.map((s, i) => <li key={i} className="text-xs text-gray-600">• {s}</li>)}
                    </ul>
                  </div>
                )}
                {fb.weaknesses.length > 0 && (
                  <div>
                    <h4 className="mb-1 flex items-center gap-1 text-xs font-semibold text-red-700">
                      <AlertTriangle className="h-3.5 w-3.5" /> Weaknesses
                    </h4>
                    <ul className="space-y-1">
                      {fb.weaknesses.map((w, i) => <li key={i} className="text-xs text-gray-600">• {w}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Risks ───────────────────────────────── */}
      <div className="card mb-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <AlertTriangle className="h-5 w-5 text-orange-500" /> Identified Risks
        </h2>
        <div className="space-y-2">
          {analysis.risks.map((r, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border border-gray-100 p-3">
              <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${sevColor[r.severity] || ""}`}>{r.severity}</span>
              <div>
                <p className="text-sm font-medium text-gray-800">{r.title}</p>
                <p className="text-xs text-gray-500">{r.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recommendations ─────────────────────── */}
      <div className="card mb-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Lightbulb className="h-5 w-5 text-yellow-500" /> Recommendations
        </h2>
        <ul className="space-y-2">
          {analysis.recommendations.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${r.priority === "high" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>{r.priority}</span>
              <span className="text-gray-700">{r.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── MVP Steps ───────────────────────────── */}
      <div className="card mb-6">
        <h2 className="mb-4 text-lg font-semibold">🚀 Recommended MVP Steps</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          {analysis.mvpSteps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
