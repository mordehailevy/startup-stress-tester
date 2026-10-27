import { ReactNode, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Rocket, PlayCircle, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { INK } from "../motion/theme";

/** Shared frame for sign-in and sign-up: same night-blue identity as the landing page. */
export default function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  const { loginDemo, user } = useAuth();
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
          : "La démo ne répond pas. Vérifie que l'API tourne, puis réessaie."
      );
      setDemoLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col" style={{ background: INK }}>
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link to="/bienvenue" className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-white">
          <Rocket className="h-5 w-5 text-brand-300" aria-hidden="true" /> Startup Stress Tester
        </Link>
      </nav>

      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-white">{title}</h1>
          <p className="mb-6 mt-2 text-brand-100/80">{subtitle}</p>

          <div className="rounded-2xl bg-white p-6 shadow-2xl shadow-black/30">{children}</div>

          {/* Already in a demo (signing up from it): don't offer to open another one. */}
          {!user?.isDemo && (
          <div className="mt-6 rounded-2xl border border-white/15 p-5 text-white">
            <p className="font-semibold">Pas encore prêt ?</p>
            <p className="mt-1 text-sm text-brand-100/75">
              Ouvre ton espace de démo : cinq idées déjà passées devant le panel, que tu peux modifier, supprimer et relancer librement.
            </p>
            <button
              onClick={tryDemo}
              disabled={demoLoading}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-semibold hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 disabled:opacity-60"
            >
              {demoLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <PlayCircle className="h-4 w-4" aria-hidden="true" />}
              Essayer la démo
            </button>
            {demoError && <p className="mt-3 text-sm text-red-300" role="alert">{demoError}</p>}
          </div>
          )}
        </div>
      </main>
    </div>
  );
}
