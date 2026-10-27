import { lazy, Suspense, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ideasAPI } from "../services/api";
import { Loader2 } from "lucide-react";
import Sparkline from "../components/Sparkline";
import { useAuth } from "../context/AuthContext";
import { scoreText, STAGE_LABEL, VERDICT_BADGE, VERDICT_LABEL } from "../lib/score";
import { INK } from "../motion/theme";

const MotionPlayer = lazy(() => import("../motion/MotionPlayer"));

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
  const { user } = useAuth();
  const isDemo = Boolean(user?.isDemo);
  const [ideas, setIdeas] = useState<IdeaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    ideasAPI
      .list()
      .then((res) =>
        // Older APIs don't send score fields yet: default them so the page still renders.
        setIdeas(
          (res.data.data ?? []).map((i: Partial<IdeaRow>) => ({
            ...i,
            latestScore: i.latestScore ?? null,
            latestVerdict: i.latestVerdict ?? null,
            scoreHistory: i.scoreHistory ?? [],
          })) as IdeaRow[]
        )
      )
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-500" aria-label="Chargement" /></div>;
  if (failed) {
    return <p className="card text-sm text-red-700" role="alert">Tes idées n'ont pas pu se charger. Vérifie que l'API tourne, puis recharge la page.</p>;
  }

  const tested = ideas.filter((i) => i.latestScore !== null);
  const best = tested.reduce<IdeaRow | null>((b, i) => (!b || (i.latestScore ?? 0) > (b.latestScore ?? 0) ? i : b), null);
  const short = (t: string) => t.split(/\s+[—–-]\s+/)[0];
  const progressed = ideas.find((i) => i.scoreHistory.length >= 2 && i.scoreHistory[i.scoreHistory.length - 1] > i.scoreHistory[0]);

  return (
    <div>
      {isDemo && (
        <section className="-mt-8 mb-10" style={{ background: INK, marginLeft: "calc(50% - 50vw)", marginRight: "calc(50% - 50vw)" }}>
          <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 pb-10 pt-8 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <div className="text-white">
              <h1 className="font-display text-4xl font-extrabold leading-[0.95] tracking-tight sm:text-5xl">Bienvenue dans la démo.</h1>
              <p className="mt-4 max-w-md leading-relaxed text-brand-100/80">
                Cinq projets sont déjà passés devant le panel.
                {progressed &&
                  ` ${short(progressed.title)} est passé de ${progressed.scoreHistory[0]} à ${progressed.scoreHistory[progressed.scoreHistory.length - 1]} en retravaillant son dossier.`}{" "}
                Ouvre un rapport, relance un test ou copie les prompts d'amélioration.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/register" className="btn-primary bg-white px-5 py-3 text-gray-900 hover:bg-brand-50 focus:ring-offset-0">
                  Tester mes propres idées
                </Link>
                {progressed && (
                  <Link to={`/ideas/${progressed._id}`} className="inline-flex items-center rounded-lg border border-white/25 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">
                    Voir une progression
                  </Link>
                )}
              </div>
            </div>
            <Suspense fallback={<div className="aspect-video rounded-2xl" style={{ background: INK }} />}>
              <MotionPlayer variant="showcase" className="rounded-2xl ring-1 ring-white/10" />
            </Suspense>
          </div>
        </section>
      )}

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-4xl font-extrabold tracking-tight">{isDemo ? "Les idées de la démo" : "Tes idées"}</h2>
          <p className="mt-1 text-sm text-gray-500">
            {ideas.length === 0
              ? "Aucune idée pour l'instant."
              : `${ideas.length} idée${ideas.length > 1 ? "s" : ""}, ${tested.length} testée${tested.length > 1 ? "s" : ""}${best ? ` — la plus solide : ${short(best.title)} (${best.latestScore})` : ""}.`}
          </p>
        </div>
      </div>

      {ideas.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-center">
          <h3 className="font-display text-2xl font-bold">Présente ta première idée au panel</h3>
          <p className="mb-6 mt-2 max-w-md text-sm text-gray-500">
            Décris-la en quelques champs. Un investisseur, un CTO, un stratège marketing et un analyste opérations la noteront et te diront quoi corriger.
          </p>
          <Link to="/ideas/new" className="btn-primary">Ajouter une idée</Link>
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
                  <h3 className="font-semibold leading-snug text-gray-900 line-clamp-2">{idea.title}</h3>
                  {idea.latestScore !== null ? (
                    <span className={`font-display text-3xl font-extrabold leading-none ${scoreText(idea.latestScore)}`}>{idea.latestScore}</span>
                  ) : (
                    <span className="shrink-0 text-xs text-gray-400">pas encore testée</span>
                  )}
                </div>
                <div className="mt-auto flex items-center gap-2">
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">{STAGE_LABEL[idea.stage] ?? idea.stage}</span>
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
