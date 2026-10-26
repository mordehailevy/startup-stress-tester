import { useEffect, useState } from "react";
import { Briefcase, Cpu, Megaphone, Truck, Loader2 } from "lucide-react";

const PANEL = [
  { role: "Venture Capital Investor", focus: "market size, returns, team", Icon: Briefcase },
  { role: "CTO / Tech Lead", focus: "feasibility, stack, complexity", Icon: Cpu },
  { role: "Marketing Strategist", focus: "audience, channels, positioning", Icon: Megaphone },
  { role: "Operations & Supply Analyst", focus: "costs, dependencies, scale", Icon: Truck },
];

/**
 * Shown while an analysis runs (the Gemini path can take ~30 s).
 * It highlights each panelist in turn; it does not pretend to know real progress.
 */
export default function PanelDeliberation({ ideaTitle }: { ideaTitle: string }) {
  const [active, setActive] = useState(0);
  const [ticks, setTicks] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setTicks((t) => t + 1);
      setActive((a) => (a + 1) % PANEL.length);
    }, 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="deliberation-title">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 id="deliberation-title" className="font-display text-2xl font-bold text-gray-900">The panel is reviewing</h2>
        <p className="mt-1 text-sm text-gray-500 line-clamp-1">{ideaTitle}</p>

        <ul className="mt-6 space-y-2" aria-live="polite">
          {PANEL.map(({ role, focus, Icon }, i) => {
            const on = i === active;
            return (
              <li key={role} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-500 ${on ? "bg-brand-50" : ""}`}>
                <span className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-500 ${on ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-400"}`}>
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className={`block text-sm font-semibold ${on ? "text-gray-900" : "text-gray-500"}`}>{role}</span>
                  <span className="block text-xs text-gray-400">{focus}</span>
                </span>
                {on && <Loader2 className="ml-auto h-4 w-4 animate-spin text-brand-500" aria-label="reviewing" />}
              </li>
            );
          })}
        </ul>

        <p className="mt-5 text-xs text-gray-400">
          {ticks * 2.2 < 20 ? "Usually done in a few seconds; up to 30 s when Gemini writes the feedback." : "Still working — Gemini is writing detailed feedback."}
        </p>
      </div>
    </div>
  );
}
