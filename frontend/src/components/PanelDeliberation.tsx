import { lazy, Suspense, useEffect, useState } from "react";
import { INK } from "../motion/theme";

const MotionPlayer = lazy(() => import("../motion/MotionPlayer"));

/**
 * Shown while an analysis runs (the Gemini path can take ~30 s): the panel scene
 * from the motion piece loops until the report is ready. It does not pretend to
 * know real progress.
 */
export default function PanelDeliberation({ ideaTitle }: { ideaTitle: string }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-950/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deliberation-title"
    >
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl shadow-2xl" style={{ background: INK }}>
        <Suspense fallback={<div className="aspect-video" style={{ background: INK }} />}>
          <MotionPlayer variant="panel" film={{ ideaTitle }} />
        </Suspense>
        <div className="flex flex-wrap items-baseline justify-between gap-2 px-6 py-4 text-white">
          <h2 id="deliberation-title" className="font-display text-xl font-bold">
            Le panel examine {ideaTitle.split(/\s+[—–-]\s+/)[0]}
          </h2>
          <p className="text-xs text-brand-100/70" aria-live="polite">
            {seconds < 15 ? "Quelques secondes en général, jusqu'à 30 s quand Gemini rédige les avis." : "Gemini rédige encore les avis détaillés…"}
          </p>
        </div>
      </div>
    </div>
  );
}
