import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ideasAPI } from "../services/api";
import { Loader2, Play, Trash2, ArrowLeft, Pencil, GitCompareArrows } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import PanelDeliberation from "../components/PanelDeliberation";
import { useAuth } from "../context/AuthContext";
import { formatDate, scoreText, STAGE_LABEL, VERDICT_BADGE, VERDICT_LABEL } from "../lib/score";

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
  updatedAt: string;
}

interface AnalysisSummary {
  _id: string;
  overallScore: number;
  verdict: string;
  createdAt: string;
}

const FIELDS: { key: keyof Idea; label: string }[] = [
  { key: "marketSizeEstimate", label: "Taille du marché" },
  { key: "revenueModel", label: "Modèle économique" },
  { key: "teamSummary", label: "Équipe" },
  { key: "techStack", label: "Stack technique" },
];

export default function IdeaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isDemo = Boolean(user?.isDemo);
  const [idea, setIdea] = useState<Idea | null>(null);
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    Promise.all([ideasAPI.get(id), ideasAPI.getAnalyses(id)])
      .then(([ideaRes, analysesRes]) => {
        setIdea(ideaRes.data.data.idea);
        setAnalyses(analysesRes.data.data ?? []);
      })
      .catch(() => setIdea(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAnalyze = async () => {
    if (!id) return;
    setError("");
    setAnalyzing(true);
    try {
      const res = await ideasAPI.analyze(id);
      navigate(`/analyses/${res.data.data.analysis._id}`);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      setError(
        status === 429
          ? "Tu as atteint la limite de stress tests pour cette heure. Réessaie plus tard."
          : "Le stress test n'a pas pu se lancer. Vérifie que l'API tourne, puis réessaie."
      );
      setAnalyzing(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm("Supprimer cette idée et tous ses rapports ? C'est définitif.")) return;
    await ideasAPI.delete(id);
    navigate("/");
  };

  const toggle = (aid: string) =>
    setSelected((s) => (s.includes(aid) ? s.filter((x) => x !== aid) : [...s.slice(-1), aid]));

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-500" aria-label="Chargement" /></div>;
  if (!idea) {
    return (
      <div className="card mx-auto max-w-md text-center">
        <p className="font-semibold">Cette idée n'existe pas ou a été supprimée.</p>
        <Link to="/" className="btn-secondary mt-4">Retour à tes idées</Link>
      </div>
    );
  }

  const history = [...analyses]
    .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))
    .map((a, i) => ({ run: i + 1, score: a.overallScore, date: formatDate(a.createdAt) }));
  const editedSinceLastRun = analyses.length > 0 && new Date(idea.updatedAt) > new Date(analyses[0].createdAt);

  return (
    <div className="mx-auto max-w-3xl">
      {analyzing && <PanelDeliberation ideaTitle={idea.title} />}

      <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {isDemo ? "Les idées de la démo" : "Tes idées"}
      </Link>

      <section className="card mb-6">
        <div className="mb-3 flex items-start justify-between gap-4">
          <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight">{idea.title}</h1>
          <span className="mt-1 shrink-0 rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700">{STAGE_LABEL[idea.stage] ?? idea.stage}</span>
        </div>
        <p className="mb-6 max-w-prose leading-relaxed text-gray-700">{idea.description}</p>

        <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <dt className="text-xs font-medium text-gray-500">{f.label}</dt>
              <dd className="mt-0.5 text-gray-800">{idea[f.key]}</dd>
            </div>
          ))}
        </dl>

        {error && <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button onClick={handleAnalyze} disabled={analyzing} className="btn-primary gap-2">
            <Play className="h-4 w-4" aria-hidden="true" /> {analyses.length ? "Relancer un stress test" : "Lancer le stress test"}
          </button>
          <Link to={`/ideas/${idea._id}/edit`} className="btn-secondary gap-2">
            <Pencil className="h-4 w-4" aria-hidden="true" /> Modifier
          </Link>
          <button onClick={handleDelete} className="ml-auto inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600">
            <Trash2 className="h-4 w-4" aria-hidden="true" /> Supprimer
          </button>
        </div>
        {editedSinceLastRun && (
          <p className="mt-3 text-xs text-brand-700">Tu as modifié cette idée depuis son dernier rapport : relance un test pour voir l'effet.</p>
        )}
      </section>

      {history.length >= 2 && (
        <section className="card mb-6">
          <h2 className="mb-4 font-display text-xl font-bold">Évolution du score</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="run" tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => `n°${v}`} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip formatter={(v: number) => [`${v}/100`, "Score"]} labelFormatter={(_, p) => p?.[0]?.payload?.date ?? ""} />
                <Line type="monotone" dataKey="score" stroke="#4c6ef5" strokeWidth={2.5} dot={{ r: 4, fill: "#4c6ef5" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {analyses.length > 0 && (
        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold">Rapports</h2>
            {analyses.length >= 2 &&
              (selected.length === 2 ? (
                <Link to={`/compare?a=${selected[0]}&b=${selected[1]}`} className="btn-primary gap-1.5 px-3 py-2 text-xs">
                  <GitCompareArrows className="h-4 w-4" aria-hidden="true" /> Comparer la sélection
                </Link>
              ) : (
                <span className="text-xs text-gray-500">Coche deux rapports pour les comparer</span>
              ))}
          </div>
          <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
            {analyses.map((a) => (
              <li key={a._id} className="flex items-center gap-3 px-4 py-3">
                {analyses.length >= 2 && (
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    checked={selected.includes(a._id)}
                    onChange={() => toggle(a._id)}
                    aria-label={`Sélectionner le rapport du ${formatDate(a.createdAt)} pour comparer`}
                  />
                )}
                <Link to={`/analyses/${a._id}`} className="flex flex-1 items-center gap-3 hover:text-brand-700">
                  <span className={`w-10 font-display text-2xl font-extrabold ${scoreText(a.overallScore)}`}>{a.overallScore}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${VERDICT_BADGE[a.verdict] ?? ""}`}>{VERDICT_LABEL[a.verdict] ?? a.verdict}</span>
                  <span className="ml-auto text-xs text-gray-400">{formatDate(a.createdAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
