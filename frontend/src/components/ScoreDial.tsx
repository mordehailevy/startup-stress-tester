import { useEffect, useState } from "react";
import { scoreHex, VERDICT_LABEL } from "../lib/score";

interface Props {
  score: number;
  verdict: string;
  size?: number;
}

/**
 * The panel's verdict as a dial: a 270° arc that fills to the overall score.
 * Fills once on mount (skipped when the user prefers reduced motion).
 */
export default function ScoreDial({ score, verdict, size = 200 }: Props) {
  const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const [shown, setShown] = useState(reduce ? score : 0);

  useEffect(() => {
    if (reduce) return;
    const t = requestAnimationFrame(() => setShown(score));
    return () => cancelAnimationFrame(t);
  }, [score, reduce]);

  const stroke = 14;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const arc = circumference * 0.75; // 270° sweep, gap at the bottom
  const filled = (arc * shown) / 100;

  return (
    <figure className="relative shrink-0" style={{ width: size, height: size }} aria-label={`Overall score ${score} out of 100, verdict ${VERDICT_LABEL[verdict] ?? verdict}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[135deg]" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${arc} ${circumference}`} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={scoreHex(score)}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          style={{ transition: reduce ? undefined : "stroke-dasharray 1.1s cubic-bezier(.2,.8,.2,1)" }}
        />
      </svg>
      <figcaption className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-6xl font-extrabold leading-none tracking-tight text-gray-900">{score}</span>
        <span className="mt-1 text-xs text-gray-400">out of 100</span>
        <span className="mt-2 font-display text-lg font-bold" style={{ color: scoreHex(score) }}>
          {VERDICT_LABEL[verdict] ?? verdict}
        </span>
      </figcaption>
    </figure>
  );
}
