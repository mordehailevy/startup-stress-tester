import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import { analysesAPI } from "../services/api";
import { DIMENSIONS, formatDate, scoreText, VERDICT_BADGE, VERDICT_LABEL } from "../lib/score";
import type { Analysis } from "./AnalysisPage";
import { DeltaText } from "./AnalysisPage";

/** Side-by-side view of two analyses: what moved, and which risks appeared or went away. */
export default function ComparePage() {
  const [params] = useSearchParams();
  const ids = [params.get("a"), params.get("b")];
  const [pair, setPair] = useState<[Analysis, Analysis] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const [a, b] = ids;
    if (!a || !b) return setError(true);
    Promise.all([analysesAPI.get(a), analysesAPI.get(b)])
      .then(([ra, rb]) => {
        const x: Analysis = ra.data.data.analysis;
        const y: Analysis = rb.data.data.analysis;
        // Always show older on the left.
        setPair(new Date(x.createdAt) <= new Date(y.createdAt) ? [x, y] : [y, x]);
      })
      .catch(() => setError(true));
  }, [params]);

  if (error) {
    return (
      <div className="card mx-auto max-w-md text-center">
        <p className="font-semibold">Choisis deux rapports à comparer depuis la page d'une idée.</p>
        <Link to="/" className="btn-secondary mt-4">Retour à tes idées</Link>
      </div>
    );
  }
  if (!pair) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;

  const [before, after] = pair;
  const beforeRisks = new Set(before.risks.map((r) => r.title));
  const afterRisks = new Set(after.risks.map((r) => r.title));
  const resolved = before.risks.filter((r) => !afterRisks.has(r.title));
  const added = after.risks.filter((r) => !beforeRisks.has(r.title));
  const date = (a: Analysis) => formatDate(a.createdAt);

  return (
    <div className="mx-auto max-w-4xl">
      <Link to={`/ideas/${after.ideaId._id}`} className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {after.ideaId.title}
      </Link>

      <h1 className="font-display text-3xl font-extrabold tracking-tight">Comparer deux rapports</h1>
      <p className="mb-6 text-sm text-gray-500">{after.ideaId.title}</p>

      <section className="card mb-6 overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500">
              <th className="pb-3 font-medium">Dimension</th>
              <th className="pb-3 text-right font-medium">
                <Link className="hover:text-brand-600" to={`/analyses/${before._id}`}>{date(before)}</Link>
              </th>
              <th className="pb-3 text-right font-medium">
                <Link className="hover:text-brand-600" to={`/analyses/${after._id}`}>{date(after)}</Link>
              </th>
              <th className="pb-3 text-right font-medium">Écart</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-3 font-semibold text-gray-900">Global</td>
              <td className="py-3 text-right">
                <span className={`font-display text-2xl font-extrabold ${scoreText(before.overallScore)}`}>{before.overallScore}</span>
                <span className={`ml-2 rounded-full px-2 py-0.5 text-[11px] font-semibold ${VERDICT_BADGE[before.verdict] ?? ""}`}>{VERDICT_LABEL[before.verdict]}</span>
              </td>
              <td className="py-3 text-right">
                <span className={`font-display text-2xl font-extrabold ${scoreText(after.overallScore)}`}>{after.overallScore}</span>
                <span className={`ml-2 rounded-full px-2 py-0.5 text-[11px] font-semibold ${VERDICT_BADGE[after.verdict] ?? ""}`}>{VERDICT_LABEL[after.verdict]}</span>
              </td>
              <td className="py-3 text-right"><DeltaText delta={after.overallScore - before.overallScore} /></td>
            </tr>
            {DIMENSIONS.map((d) => (
              <tr key={d.key} className="border-b border-gray-50 last:border-0">
                <td className="py-2.5 text-gray-700">{d.label}</td>
                <td className={`py-2.5 text-right font-semibold ${scoreText(before.scores[d.key])}`}>{before.scores[d.key]}</td>
                <td className={`py-2.5 text-right font-semibold ${scoreText(after.scores[d.key])}`}>{after.scores[d.key]}</td>
                <td className="py-2.5 text-right"><DeltaText delta={after.scores[d.key] - before.scores[d.key]} small /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="card">
          <h2 className="mb-3 font-display text-lg font-bold">Risques disparus</h2>
          {resolved.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun : tous les risques précédents sont toujours là.</p>
          ) : (
            <ul className="space-y-2">{resolved.map((r) => <li key={r.title} className="text-sm text-gray-700 line-through decoration-green-500">{r.title}</li>)}</ul>
          )}
        </section>
        <section className="card">
          <h2 className="mb-3 font-display text-lg font-bold">Nouveaux risques</h2>
          {added.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun nouveau risque.</p>
          ) : (
            <ul className="space-y-2">{added.map((r) => <li key={r.title} className="text-sm text-gray-700">{r.title}</li>)}</ul>
          )}
        </section>
      </div>
    </div>
  );
}
