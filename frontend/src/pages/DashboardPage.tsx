import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ideasAPI } from "../services/api";
import { Loader2 } from "lucide-react";
import Sparkline from "../components/Sparkline";
import { scoreText, VERDICT_BADGE, VERDICT_LABEL } from "../lib/score";

interface IdeaRow {
  _id: string;
  title: string;
  stage: string;
  createdAt: string;
  latestScore: number | null;
  latestVerdict: string | null;
  scoreHistory: number[];
}

export default function DashboardPage() {
  const [ideas, setIdeas] = useState<IdeaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    ideasAPI
      .list()
      .then((res) => setIdeas(res.data.data ?? []))
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;
  if (failed) {
    return <p className="card text-sm text-red-700" role="alert">Your ideas couldn't load. Check that the API is running, then refresh.</p>;
  }

  const tested = ideas.filter((i) => i.latestScore !== null);
  const best = tested.reduce<IdeaRow | null>((b, i) => (!b || (i.latestScore ?? 0) > (b.latestScore ?? 0) ? i : b), null);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight">Your ideas</h1>
          <p className="mt-1 text-sm text-gray-500">
            {ideas.length === 0
              ? "Nothing tested yet."
              : `${ideas.length} idea${ideas.length > 1 ? "s" : ""}, ${tested.length} stress-tested${best ? ` — strongest so far: ${best.title.split(/\s+[—–-]\s+/)[0]} (${best.latestScore})` : ""}.`}
          </p>
        </div>
      </div>

      {ideas.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-center">
          <h2 className="font-display text-2xl font-bold">Put your first idea in front of the panel</h2>
          <p className="mb-6 mt-2 max-w-md text-sm text-gray-500">
            Describe it in a few fields. An investor, a CTO, a marketer and an operations analyst will score it and tell you what to fix.
          </p>
          <Link to="/ideas/new" className="btn-primary">Add an idea</Link>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ideas.map((idea) => (
            <li key={idea._id}>
              <Link
                to={`/ideas/${idea._id}`}
                className="card flex h-full flex-col gap-4 transition-colors hover:border-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold leading-snug text-gray-900 line-clamp-2">{idea.title}</h2>
                  {idea.latestScore !== null ? (
                    <span className={`font-display text-3xl font-extrabold leading-none ${scoreText(idea.latestScore)}`}>{idea.latestScore}</span>
                  ) : (
                    <span className="shrink-0 text-xs text-gray-400">not tested</span>
                  )}
                </div>
                <div className="mt-auto flex items-center gap-2">
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">{idea.stage}</span>
                  {idea.latestVerdict && (
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${VERDICT_BADGE[idea.latestVerdict] ?? ""}`}>
                      {VERDICT_LABEL[idea.latestVerdict]}
                    </span>
                  )}
                  <span className="ml-auto"><Sparkline values={idea.scoreHistory} /></span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
