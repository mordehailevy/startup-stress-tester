import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Rocket, LogOut, PlusCircle } from "lucide-react";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Navbar ─────────────────────────────── */}
      <header className="print:hidden sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2 whitespace-nowrap font-display text-lg font-extrabold tracking-tight text-brand-700 sm:text-xl">
            <Rocket className="h-6 w-6 shrink-0" />
            Startup Stress Tester
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/ideas/new" className="btn-primary flex items-center gap-1.5 px-3 text-xs sm:px-5 sm:text-sm">
              <PlusCircle className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">New idea</span>
            </Link>
            <span className="hidden text-sm text-gray-500 sm:inline">{user?.fullName}</span>
            <button onClick={handleLogout} className="btn-secondary flex items-center gap-1.5 px-3 text-xs sm:px-5 sm:text-sm">
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">Log out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content ──────────────────────── */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>

      {/* ── Footer ────────────────────────────── */}
      <footer className="print:hidden border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Startup Stress Tester — Built by Mordehai Levy
      </footer>
    </div>
  );
}
