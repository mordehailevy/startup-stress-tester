import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import Scene3D from "./Scene3D";
import { BEATS, DIMENSIONS, HEIGHT, INK, INK_SOFT, OVERALL, PANELISTS, PAPER, WIDTH, scoreColor } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.2, 0.8, 0.2, 1);
const display = '"Bricolage Grotesque", Inter, system-ui, sans-serif';
const body = "Inter, system-ui, sans-serif";

/** Fades/slides a block in over [a, b] and out over [c, d]. */
function useInOut(a: number, b: number, c: number, d: number) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [a, b, c, d], [0, 1, 1, 0], clamp);
  const y = interpolate(frame, [a, b], [24, 0], { ...clamp, easing: ease });
  return { opacity, transform: `translateY(${y}px)` };
}

/** Left-hand caption that changes with each act of the piece. */
function Caption() {
  const act1 = useInOut(4, 22, 88, 100);
  const act2 = useInOut(98, 114, 190, 202);
  const act3 = useInOut(232, 248, 335, 352);

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
        <h2 style={title}>Ton idée.</h2>
        <p style={sub}>Décris ton projet en quelques champs : problème, marché, équipe, modèle économique.</p>
      </div>
      <div style={{ position: "absolute", ...act2 }}>
        <h2 style={title}>Face à quatre experts.</h2>
        <PanelList />
      </div>
      <div style={{ position: "absolute", ...act3 }}>
        <h2 style={title}>Un verdict chiffré.</h2>
        <p style={sub}>Score sur 100, risques prioritaires, actions concrètes et plan MVP.</p>
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
function ScoreReadout() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const count = Math.round(interpolate(frame, [BEATS.bars[0], BEATS.bars[1]], [0, OVERALL], { ...clamp, easing: ease }));
  const box = useInOut(BEATS.bars[0] - 4, BEATS.bars[0] + 12, 338, 354);
  const verdict = spring({ frame: frame - BEATS.verdict[0], fps, config: { damping: 13 } });

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
          background: scoreColor(OVERALL),
          opacity: verdict,
          transform: `scale(${0.8 + verdict * 0.2})`,
        }}
      >
        Prometteur
      </div>
    </div>
  );
}

/** Dimension labels under the 3D bars. */
function BarLabels() {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [BEATS.bars[0] + 20, BEATS.bars[0] + 40, 338, 354], [0, 1, 1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 815, right: 185, bottom: 92, display: "flex", justifyContent: "space-between", opacity: o }}>
      {DIMENSIONS.map((d) => (
        <div key={d.label} style={{ textAlign: "center", width: 120 }}>
          <div style={{ fontFamily: display, fontWeight: 800, fontSize: 30, color: scoreColor(d.score) }}>{d.score}</div>
          <div style={{ fontFamily: body, fontSize: 16, color: "#9aa6d8" }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}

/** Full 12 s loop: idea → panel → verdict. Plays live in the page through the Remotion Player. */
export default function StressTestFilm() {
  const frame = useCurrentFrame();
  const fadeLoop = interpolate(frame, [0, 8, BEATS.fadeOut[0] + 10, BEATS.fadeOut[1]], [0, 1, 1, 0], clamp);

  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 90% at 70% 45%, ${INK_SOFT} 0%, ${INK} 62%)` }}>
      <AbsoluteFill style={{ opacity: fadeLoop }}>
        <ThreeCanvas width={WIDTH} height={HEIGHT} camera={{ fov: 40, position: [0, 0.2, 8.6] }} gl={{ antialias: true }}>
          <Scene3D />
        </ThreeCanvas>
        <Caption />
        <ScoreReadout />
        <BarLabels />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
