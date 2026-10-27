import { useEffect, useRef, useState } from "react";
import { Player, PlayerRef } from "@remotion/player";
import { RotateCcw } from "lucide-react";
import StressTestFilm from "./StressTestFilm";
import { BEATS, DURATION, FPS, FilmProps, HEIGHT, INK, PANEL_LOOP, WIDTH } from "./theme";

export type MotionVariant = "showcase" | "report" | "panel";

interface Props {
  variant: MotionVariant;
  film?: FilmProps;
  className?: string;
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
}

/**
 * The 3D motion piece, played live in the page.
 * - showcase: marketing loop (landing, demo welcome)
 * - report:   plays once with the analysis' real data, then holds on the verdict; can be replayed
 * - panel:    loops the panel-review stretch while an analysis is running
 * Default export so pages can lazy-load it (Three.js + Remotion stay out of the main bundle).
 */
export default function MotionPlayer({ variant, film, className }: Props) {
  const ref = useRef<PlayerRef>(null);
  const reduce = prefersReducedMotion();
  const [ended, setEnded] = useState(false);

  // Dev only: ?frame=N freezes the piece on a frame, to review it.
  const debugFrame = import.meta.env.DEV ? Number(new URLSearchParams(window.location.search).get("frame") ?? NaN) : NaN;
  const frozen = reduce || !Number.isNaN(debugFrame);

  const holdFrame = DURATION - 1;
  const initialFrame = !Number.isNaN(debugFrame)
    ? debugFrame
    : reduce
      ? variant === "panel"
        ? PANEL_LOOP.inFrame + 40
        : variant === "report"
          ? holdFrame
          : BEATS.verdict[1]
      : variant === "panel"
        ? PANEL_LOOP.inFrame
        : 0;

  useEffect(() => {
    const p = ref.current;
    if (!p || variant !== "report") return;
    const onEnded = () => setEnded(true);
    p.addEventListener("ended", onEnded);
    return () => p.removeEventListener("ended", onEnded);
  }, [variant]);

  // Only animate while the piece is on screen and the tab is visible: saves battery and GPU.
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = wrapRef.current;
    const p = ref.current;
    if (!el || !p || frozen) return;
    let onScreen = true;
    const sync = () => {
      const visible = onScreen && document.visibilityState === "visible";
      // A finished report stays on its verdict; don't restart it.
      if (visible && !(variant === "report" && p.getCurrentFrame() >= holdFrame)) p.play();
      else if (!visible) p.pause();
    };
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    }, { threshold: 0.15 });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [frozen, variant, holdFrame]);

  const replay = () => {
    setEnded(false);
    ref.current?.seekTo(0);
    ref.current?.play();
  };

  return (
    <div ref={wrapRef} className={`relative overflow-hidden ${className ?? ""}`} style={{ background: INK }}>
      <Player
        ref={ref}
        component={StressTestFilm}
        inputProps={{ ...film, mode: variant === "report" ? "report" : "loop" }}
        durationInFrames={DURATION}
        fps={FPS}
        compositionWidth={WIDTH}
        compositionHeight={HEIGHT}
        style={{ width: "100%", aspectRatio: `${WIDTH} / ${HEIGHT}` }}
        autoPlay={!frozen}
        loop={variant !== "report"}
        inFrame={variant === "panel" ? PANEL_LOOP.inFrame : null}
        outFrame={variant === "panel" ? PANEL_LOOP.outFrame : null}
        initialFrame={initialFrame}
        controls={reduce && variant !== "panel"}
        clickToPlay={false}
        acknowledgeRemotionLicense
        renderLoading={() => <div style={{ width: "100%", height: "100%", background: INK }} />}
      />
      {variant === "report" && (ended || reduce) && (
        <button
          onClick={replay}
          className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white print:hidden"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Revoir l'animation
        </button>
      )}
    </div>
  );
}
