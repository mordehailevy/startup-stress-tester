import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import Scene3D from "./Scene3D";
import { BEATS, HEIGHT, INK, INK_SOFT, PANELISTS, PAPER, WIDTH, scoreColor, FilmProps, SHOWCASE, VERDICT_FR, dimensionsOf } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.2, 0.8, 0.2, 1);
const display = '"Bricolage Grotesque", Inter, system-ui, sans-serif';
const body = "Inter, system-ui, sans-serif";

/** Fades/slides a block in over [a, b] and out over [c, d]. */
function useInOut(a: number, b: number, c: number, d: number, hold = false) {
  const frame = useCurrentFrame();
  const opacity = hold ? interpolate(frame, [a, b], [0, 1], clamp) : interpolate(frame, [a, b, c, d], [0, 1, 1, 0], clamp);
  const y = interpolate(frame, [a, b], [24, 0], { ...clamp, easing: ease });
  return { opacity, transform: `translateY(${y}px)` };
}

/** Left-hand caption that changes with each act of the piece. */
function Caption({ ideaTitle, hold }: { ideaTitle: string; hold: boolean }) {
  const act1 = useInOut(4, 22, 88, 100);
  const act2 = useInOut(98, 114, 190, 202);
  const act3 = useInOut(232, 248, 335, 352, hold);
  const name = ideaTitle.split(/\s+[—–-]\s+/)[0];

  const title: React.CSSProperties = {
    fontFamily: display,
    fontWeight: 800,
    fontSize: 84,
    lineHeight: 0.98,
    letterSpacing: -2.5,
    color: PAPER,
    margin: 0,
  };
  const sub: React.CSSProperties = { fontFamily: body, fontSize: 26, lineHeight: 1.45, color: "#b8c3f2", marginTop: 22, maxWidth: 560 };

  return (
    <div style={{ position: "absolute", left: 96, top: 0, bottom: 0, width: 640, display: "flex", alignItems: "center" }}>
      <div style={{ position: "absolute", ...act1 }}>
        <h2 style={title}>{name ? `${name}.` : "Ton idée."}</h2>
        <p style={sub}>{name ? "Ton dossier entre devant le panel." : "Décris ton projet en quelques champs : problème, marché, équipe, modèle économique."}</p>
      </div>
      <div style={{ position: "absolute", ...act2 }}>
        <h2 style={title}>Face à quatre experts.</h2>
        <PanelList />
      </div>
      <div style={{ position: "absolute", ...act3 }}>
        <h2 style={title}>{name ? "Le verdict." : "Un verdict chiffré."}</h2>
        <p style={sub}>{name ? "Le détail est juste en dessous : avis du panel, risques et prompts pour gagner des points." : "Score sur 100, risques prioritaires, actions concrètes et plan MVP."}</p>
      </div>
    </div>
  );
}

/** The four panelists, each lighting up in step with its ring in the 3D scene. */
function PanelList() {
  const frame = useCurrentFrame();
  const slot = (BEATS.scan[1] - BEATS.scan[0]) / PANELISTS.length;
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: "28px 0 0", display: "grid", gap: 12 }}>
      {PANELISTS.map((p, i) => {
        const start = BEATS.scan[0] + i * slot;
        const on = interpolate(frame, [start, start + 6, start + slot - 4, start + slot], [0, 1, 1, 0.35], clamp);
        const seen = frame >= start ? 1 : 0.35;
        return (
          <li key={p.label} style={{ display: "flex", alignItems: "center", gap: 16, opacity: Math.max(on, seen === 1 ? 0.55 : 0.35) }}>
            <span style={{ width: 14, height: 14, borderRadius: 99, background: p.color, boxShadow: `0 0 ${18 * on}px ${p.color}` }} />
            <span style={{ fontFamily: display, fontWeight: 700, fontSize: 30, color: PAPER, width: 200 }}>{p.label}</span>
            <span style={{ fontFamily: body, fontSize: 20, color: "#9aa6d8" }}>{p.focus}</span>
          </li>
        );
      })}
    </ul>
  );
}

/** The overall score that counts up, then the verdict word. */
function ScoreReadout({ overall, verdict, hold }: { overall: number; verdict: string; hold: boolean }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const count = Math.round(interpolate(frame, [BEATS.bars[0], BEATS.bars[1]], [0, overall], { ...clamp, easing: ease }));
  const box = useInOut(BEATS.bars[0] - 4, BEATS.bars[0] + 12, 338, 354, hold);
  const pop = spring({ frame: frame - BEATS.verdict[0], fps, config: { damping: 13 } });

  return (
    <div style={{ position: "absolute", right: 110, top: 92, textAlign: "right", ...box }}>
      <div style={{ fontFamily: display, fontWeight: 800, fontSize: 150, lineHeight: 0.85, color: PAPER, letterSpacing: -6 }}>
        {count}
        <span style={{ fontSize: 44, color: "#7f8bc4", letterSpacing: 0 }}>/100</span>
      </div>
      <div
        style={{
          display: "inline-block",
          marginTop: 18,
          padding: "8px 22px",
          borderRadius: 99,
          fontFamily: display,
          fontWeight: 800,
          fontSize: 32,
          color: INK,
          background: scoreColor(overall),
          opacity: pop,
          transform: `scale(${0.8 + pop * 0.2})`,
        }}
      >
        {VERDICT_FR[verdict] ?? verdict}
      </div>
    </div>
  );
}

/** Dimension labels under the 3D bars. */
function BarLabels({ dimensions, hold }: { dimensions: { label: string; score: number }[]; hold: boolean }) {
  const frame = useCurrentFrame();
  const o = hold
    ? interpolate(frame, [BEATS.bars[0] + 20, BEATS.bars[0] + 40], [0, 1], clamp)
    : interpolate(frame, [BEATS.bars[0] + 20, BEATS.bars[0] + 40, 338, 354], [0, 1, 1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 815, right: 185, bottom: 92, display: "flex", justifyContent: "space-between", opacity: o }}>
      {dimensions.map((d) => (
        <div key={d.label} style={{ textAlign: "center", width: 120 }}>
          <div style={{ fontFamily: display, fontWeight: 800, fontSize: 30, color: scoreColor(d.score) }}>{d.score}</div>
          <div style={{ fontFamily: body, fontSize: 16, color: "#9aa6d8" }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}

/** Idea → panel → verdict, 12 s. Plays live in the page through the Remotion Player, with real or showcase data. */
export default function StressTestFilm(props: FilmProps) {
  const { mode, ideaTitle, overall, verdict, scores } = { ...SHOWCASE, ...props };
  const hold = mode === "report";
  const dimensions = dimensionsOf(scores);
  const frame = useCurrentFrame();
  const fadeLoop = hold
    ? interpolate(frame, [0, 8], [0, 1], clamp)
    : interpolate(frame, [0, 8, BEATS.fadeOut[0] + 10, BEATS.fadeOut[1]], [0, 1, 1, 0], clamp);

  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 90% at 70% 45%, ${INK_SOFT} 0%, ${INK} 62%)` }}>
      <AbsoluteFill style={{ opacity: fadeLoop }}>
        {/* dpr 1: the 1600×900 composition is already larger than any embed; 2× on Retina would quadruple the GPU work. */}
        <ThreeCanvas width={WIDTH} height={HEIGHT} dpr={1} camera={{ fov: 40, position: [0, 0.2, 8.6] }} gl={{ antialias: true, powerPreference: "low-power" }}>
          <Scene3D dimensions={dimensions} />
        </ThreeCanvas>
        <Caption ideaTitle={ideaTitle} hold={hold} />
        <ScoreReadout overall={overall} verdict={verdict} hold={hold} />
        <BarLabels dimensions={dimensions} hold={hold} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
