import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Rocket, Loader2 } from "lucide-react";
import MotionPlayer from "../motion/MotionPlayer";
import { useAuth } from "../context/AuthContext";
import { INK } from "../motion/theme";

const STEPS = [
  {
    title: "Décris ton idée",
    text: "Problème, marché, équipe, stack, modèle économique et stade du projet. Dix minutes suffisent.",
  },
  {
    title: "Le panel l'évalue",
    text: "Un investisseur, un CTO, un stratège marketing et un analyste opérations notent chacun leur domaine.",
  },
  {
    title: "Corrige et relance",
    text: "Modifie les points faibles, relance le test et compare les deux rapports pour voir ce qui a bougé.",
  },
];

export default function LandingPage() {
  const { loginDemo } = useAuth();
  const navigate = useNavigate();
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState("");

  const tryDemo = async () => {
    setDemoError("");
    setDemoLoading(true);
    try {
      await loginDemo();
      navigate("/");
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      setDemoError(
        status === 429
          ? "Trop de démos ouvertes depuis cette connexion. Réessaie dans une heure."
          : "La démo ne répond pas pour l'instant. Réessaie dans un moment."
      );
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* ── Hero: the 3D motion piece, live in the page ── */}
      <section style={{ background: INK }} className="text-white">
        <div className="mx-auto max-w-7xl px-4 pb-14 pt-6 sm:px-6">
          <nav className="mb-10 flex items-center justify-between">
            <span className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight">
              <Rocket className="h-5 w-5 text-brand-300" aria-hidden="true" /> Startup Stress Tester
            </span>
            <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-semibold text-brand-100 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300">
              Se connecter
            </Link>
          </nav>

          <div className="mb-10 max-w-3xl">
            <h1 className="font-display text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl">
              Mets ton idée de startup sous pression avant les investisseurs.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-brand-100/80">
              Un panel de quatre experts note ton projet sur cinq dimensions, liste les risques et te dit quoi corriger en premier.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary bg-white px-6 py-3 text-base text-gray-900 hover:bg-brand-50 focus:ring-offset-0">
                Tester mon idée
              </Link>
              <button
                onClick={tryDemo}
                disabled={demoLoading}
                className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-6 py-3 text-base font-semibold text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 disabled:opacity-60"
              >
                {demoLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                Essayer la démo
              </button>
            </div>
            {demoError && <p className="mt-3 text-sm text-red-300" role="alert">{demoError}</p>}
          </div>

          <div className="overflow-hidden rounded-2xl ring-1 ring-white/10 shadow-2xl shadow-black/40">
            <MotionPlayer variant="showcase" />
          </div>
          <p className="sr-only">
            Animation : une idée de startup apparaît, quatre experts l'examinent tour à tour, puis elle obtient un score de 72 sur 100, verdict prometteur, avec un score par dimension.
          </p>
        </div>
      </section>

      {/* ── How it works: a real sequence, so it's numbered ── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Comment ça marche</h2>
        <ol className="mt-10 grid gap-10 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <span className="font-display text-5xl font-extrabold text-brand-200">{i + 1}</span>
              <h3 className="mt-3 font-display text-xl font-bold">{s.title}</h3>
              <p className="mt-2 max-w-sm leading-relaxed text-gray-600">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-gray-100">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-16 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="max-w-xl font-display text-2xl font-bold leading-snug">
            Le premier rapport prend quelques secondes. Le deuxième te montre si tu progresses.
          </p>
          <Link to="/register" className="btn-primary px-6 py-3 text-base">Créer mon compte</Link>
        </div>
      </section>

      <footer className="py-6 text-center text-xs text-gray-400">© {new Date().getFullYear()} Startup Stress Tester — conçu par Mordehai Levy</footer>
    </div>
  );
}
