import { useState, useEffect, FormEvent } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { ideasAPI, IdeaPayload } from "../services/api";

const STAGES = [
  { value: "idea", label: "Idée" },
  { value: "prototype", label: "Prototype" },
  { value: "mvp", label: "MVP" },
  { value: "growth", label: "Croissance" },
  { value: "scale", label: "Expansion" },
];

/** Create a new idea, or edit one when the route has an :id (/ideas/:id/edit). */
export default function NewIdeaPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const editing = Boolean(id);
  // ?focus=revenueModel — set by the coaching prompts to land on the field to rewrite.
  const [params] = useSearchParams();
  const focus = params.get("focus");
  const [loadingIdea, setLoadingIdea] = useState(editing);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<IdeaPayload>({
    title: "",
    description: "",
    marketSizeEstimate: "",
    teamSummary: "",
    techStack: "",
    revenueModel: "",
    stage: "idea",
  });

  useEffect(() => {
    if (!id) return;
    ideasAPI
      .get(id)
      .then((res) => {
        const i = res.data.data.idea;
        setForm({
          title: i.title,
          description: i.description,
          marketSizeEstimate: i.marketSizeEstimate,
          teamSummary: i.teamSummary,
          techStack: i.techStack,
          revenueModel: i.revenueModel,
          stage: i.stage,
        });
      })
      .catch(() => setError("Cette idée n'existe pas ou a été supprimée."))
      .finally(() => setLoadingIdea(false));
  }, [id]);

  useEffect(() => {
    if (loadingIdea || !focus) return;
    const el = document.getElementById(`f-${focus}`) as HTMLInputElement | HTMLTextAreaElement | null;
    if (!el) return;
    el.scrollIntoView({ block: "center" });
    el.focus();
    el.select();
  }, [loadingIdea, focus]);

  const update = (field: keyof IdeaPayload, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (id) {
        await ideasAPI.update(id, form);
        navigate(`/ideas/${id}`);
      } else {
        const res = await ideasAPI.create(form);
        navigate(`/ideas/${res.data.data.idea._id}`);
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || (editing ? "Les modifications n'ont pas pu être enregistrées. Vérifie les champs et réessaie." : "L'idée n'a pas pu être créée. Vérifie les champs et réessaie.");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (loadingIdea) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-500" aria-label="Chargement" /></div>;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 font-display text-3xl font-extrabold tracking-tight">{editing ? "Modifier l'idée" : "Nouvelle idée"}</h1>
      <p className="mb-6 text-sm text-gray-500">
        {editing ? "Renforce les points faibles, puis relance un stress test pour mesurer l'effet." : "Plus tu es précis, plus les avis du panel seront utiles."}
      </p>

      {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="label" htmlFor="f-title">Nom du projet</label>
          <input className="input" value={form.title} id="f-title" onChange={(e) => update("title", e.target.value)} placeholder="ex. Récolte — l'anti-gaspillage pour restaurants" required />
        </div>

        <div>
          <label className="label" htmlFor="f-description">Description</label>
          <textarea className="input min-h-[120px]" value={form.description} id="f-description" onChange={(e) => update("description", e.target.value)}
            placeholder="Le problème, qui le subit, ta solution, ce qui la rend unique, comment tu trouves tes clients…" required />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="f-marketSizeEstimate">Taille du marché</label>
            <input className="input" value={form.marketSizeEstimate} id="f-marketSizeEstimate" onChange={(e) => update("marketSizeEstimate", e.target.value)}
              placeholder="ex. 30 000 restaurants ciblés × 708 € par an = 21 M€" required />
          </div>
          <div>
            <label className="label" htmlFor="f-stage">Stade</label>
            <select className="input" value={form.stage} id="f-stage" onChange={(e) => update("stage", e.target.value)}>
              {STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="f-teamSummary">Équipe</label>
          <textarea className="input min-h-[80px]" value={form.teamSummary} id="f-teamSummary" onChange={(e) => update("teamSummary", e.target.value)}
            placeholder="Qui compose l'équipe ? Rôles, années d'expérience, points forts…" required />
        </div>

        <div>
          <label className="label" htmlFor="f-techStack">Stack technique</label>
          <input className="input" value={form.techStack} id="f-techStack" onChange={(e) => update("techStack", e.target.value)}
            placeholder="ex. React, Node.js, PostgreSQL, Docker, AWS" required />
        </div>

        <div>
          <label className="label" htmlFor="f-revenueModel">Modèle économique</label>
          <textarea className="input min-h-[80px]" value={form.revenueModel} id="f-revenueModel" onChange={(e) => update("revenueModel", e.target.value)}
            placeholder="Comment gagnes-tu de l'argent ? Prix, abonnement, commission, B2B ou B2C…" required />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary flex-1" disabled={loading}>
            {loading ? "Enregistrement…" : editing ? "Enregistrer les modifications" : "Enregistrer l'idée"}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate(id ? `/ideas/${id}` : "/")}>
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
