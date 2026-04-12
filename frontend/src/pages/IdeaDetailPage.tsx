import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ideasAPI } from "../services/api";
import { Loader2, Play, Trash2, ArrowLeft, BarChart3 } from "lucide-react";

interface Idea {
  _id: string;
  title: string;
  description: string;
  marketSizeEstimate: string;
  teamSummary: string;
  techStack: string;
  revenueModel: string;
  stage: string;
  createdAt: string;
}

interface AnalysisSummary {
  _id: string;
  overallScore: number;
  verdict: string;
  createdAt: string;
}

export default function IdeaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([ideasAPI.get(id), ideasAPI.getAnalyses(id)])
      .then(([ideaRes, analysesRes]) => {
        setIdea(ideaRes.data.data.idea);
        setAnalyses(analysesRes.data.data.analyses);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAnalyze = async () => {
    if (!id) return;
    setAnalyzing(true);
    try {
      const res = await ideasAPI.analyze(id);
      navigate(`/analyses/${res.data.data.analysis._id}`);
    } catch {
      setAnalyzing(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm("Are you sure you want to delete this idea?")) return;
    await ideasAPI.delete(id);
    navigate("/");
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;
  if (!idea) return <p>Idea not found</p>;

  const verdictColor: Record<string, string> = {
    strong: "text-green-700 bg-green-100",
    promising: "text-blue-700 bg-blue-100",
    "needs-work": "text-yellow-700 bg-yellow-100",
    weak: "text-red-700 bg-red-100",
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      <div className="card mb-6">
        <div className="mb-4 flex items-start justify-between">
          <h1 className="text-2xl font-bold">{idea.title}</h1>
          <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700">{idea.stage}</span>
        </div>

        <p className="mb-4 text-gray-700 leading-relaxed">{idea.description}</p>

        <div className="grid gap-4 sm:grid-cols-2 text-sm">
          <div><span className="font-semibold text-gray-500">Market Size:</span> <span className="text-gray-800">{idea.marketSizeEstimate}</span></div>
          <div><span className="font-semibold text-gray-500">Tech Stack:</span> <span className="text-gray-800">{idea.techStack}</span></div>
          <div><span className="font-semibold text-gray-500">Team:</span> <span className="text-gray-800">{idea.teamSummary}</span></div>
          <div><span className="font-semibold text-gray-500">Revenue Model:</span> <span className="text-gray-800">{idea.revenueModel}</span></div>
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={handleAnalyze} disabled={analyzing} className="btn-primary flex items-center gap-2">
            {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {analyzing ? "Analyzing…" : "Run Stress Test"}
          </button>
          <button onClick={handleDelete} className="btn-danger flex items-center gap-2">
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      </div>

      {/* Previous analyses */}
      {analyses.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Previous Analyses</h2>
          <div className="space-y-2">
            {analyses.map((a) => (
              <Link key={a._id} to={`/analyses/${a._id}`} className="card flex items-center justify-between transition hover:shadow-md">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-brand-500" />
                  <div>
                    <span className="text-sm font-medium">Score: {a.overallScore}/100</span>
                    <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${verdictColor[a.verdict] || ""}`}>{a.verdict}</span>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleDateString()}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
