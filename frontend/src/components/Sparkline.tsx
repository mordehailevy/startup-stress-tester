import { scoreHex } from "../lib/score";

interface Props {
  values?: number[];
  width?: number;
  height?: number;
}

/** Tiny score trend (0–100 scale) coloured by the latest score. */
export default function Sparkline({ values = [], width = 96, height = 28 }: Props) {
  if (values.length < 2) return null;
  const pad = 3;
  const step = (width - pad * 2) / (values.length - 1);
  const y = (v: number) => pad + (height - pad * 2) * (1 - v / 100);
  const points = values.map((v, i) => `${pad + i * step},${y(v)}`).join(" ");
  const last = values[values.length - 1];
  const delta = last - values[0];

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Évolution du score sur ${values.length} rapports : ${delta >= 0 ? "+" : "−"}${Math.abs(delta)} points`}>
      <polyline points={points} fill="none" stroke="#cbd5e1" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={pad + (values.length - 1) * step} cy={y(last)} r={3} fill={scoreHex(last)} />
    </svg>
  );
}
