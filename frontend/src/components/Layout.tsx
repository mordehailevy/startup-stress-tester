import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Rocket, LogOut, PlusCircle, Sparkles } from "lucide-react";
import { INK } from "../motion/theme";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isDemo = Boolean(user?.isDemo);
  const hoursLeft = user?.demoExpiresAt
    ? Math.max(1, Math.ceil((new Date(user.demoExpiresAt).getTime() - Date.now()) / 3_600_000))
    : null;

  const handleLogout = () => {
    logout();
    navigate(isDemo ? "/bienvenue" : "/login");
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* ── Header: same night blue as the landing page ── */}
      <header className="sticky top-0 z-50 print:hidden" style={{ background: INK }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2 whitespace-nowrap font-display text-lg font-extrabold tracking-tight text-white sm:text-xl">
            <Rocket className="h-6 w-6 shrink-0 text-brand-300" aria-hidden="true" />
            {/* On narrow screens in the demo, the actions need the room: keep the logo only. */}
            <span className={isDemo ? "sr-only sm:not-sr-only" : ""}>Startup Stress Tester</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/ideas/new" className="btn-primary flex items-center gap-1.5 px-3 text-xs sm:px-5 sm:text-sm">
              <PlusCircle className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">Nouvelle idée</span>
            </Link>
            {isDemo && (
              <Link to="/register" className="btn-primary whitespace-nowrap bg-white px-3 text-xs text-gray-900 hover:bg-brand-50 sm:px-5 sm:text-sm">
                Garder mes idées
              </Link>
            )}
            <span className="hidden text-sm text-brand-100/70 md:inline">{user?.fullName}</span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-brand-100 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 sm:text-sm"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">{isDemo ? "Quitter la démo" : "Se déconnecter"}</span>
            </button>
          </div>
        </div>

        {isDemo && (
          <div className="border-t border-white/10 bg-brand-600/30">
            <p className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2 text-xs text-brand-50 sm:px-6 sm:text-sm">
              <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                Ton espace de démo : tout fonctionne, ajoute et modifie des idées librement.
                {hoursLeft !== null && ` Il est conservé encore ${hoursLeft} h.`}{" "}
                <Link to="/register" className="font-semibold underline underline-offset-2">Crée ton compte</Link> pour tout garder.
              </span>
            </p>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-400 print:hidden">
        © {new Date().getFullYear()} Startup Stress Tester — conçu par Mordehai Levy
      </footer>
    </div>
  );
}
