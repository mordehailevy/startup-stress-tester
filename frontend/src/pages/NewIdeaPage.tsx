import { useState, useEffect, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { ideasAPI, IdeaPayload } from "../services/api";

const STAGES = [
  { value: "idea", label: "💡 Idea" },
  { value: "prototype", label: "🔧 Prototype" },
  { value: "mvp", label: "🚀 MVP" },
  { value: "growth", label: "📈 Growth" },
  { value: "scale", label: "🏢 Scale" },
];

/** Create a new idea, or edit one when the route has an :id (/ideas/:id/edit). */
export default function NewIdeaPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const editing = Boolean(id);
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
      .catch(() => setError("This idea doesn't exist or was deleted."))
      .finally(() => setLoadingIdea(false));
  }, [id]);

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
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || (editing ? "Couldn't save your changes. Check the fields and try again." : "Couldn't create the idea. Check the fields and try again.");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (loadingIdea) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 font-display text-3xl font-extrabold tracking-tight">{editing ? "Edit idea" : "New startup idea"}</h1>
      <p className="mb-6 text-sm text-gray-500">
        {editing ? "Tighten the weak spots, then run a new stress test to see what changed." : "The more specific you are, the more useful the panel's feedback."}
      </p>

      {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="label" htmlFor="f-title">Project name</label>
          <input className="input" value={form.title} id="f-title" onChange={(e) => update("title", e.target.value)} placeholder="e.g. EcoTrack — Carbon Tracker for SMBs" required />
        </div>

        <div>
          <label className="label" htmlFor="f-description">Description</label>
          <textarea className="input min-h-[120px]" value={form.description} id="f-description" onChange={(e) => update("description", e.target.value)}
            placeholder="Describe the problem you're solving, your solution, and what makes it unique…" required />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="f-marketSizeEstimate">Market size</label>
            <input className="input" value={form.marketSizeEstimate} id="f-marketSizeEstimate" onChange={(e) => update("marketSizeEstimate", e.target.value)}
              placeholder="e.g. $12B global market, 22% CAGR" required />
          </div>
          <div>
            <label className="label" htmlFor="f-stage">Stage</label>
            <select className="input" value={form.stage} id="f-stage" onChange={(e) => update("stage", e.target.value)}>
              {STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="f-teamSummary">Team</label>
          <textarea className="input min-h-[80px]" value={form.teamSummary} id="f-teamSummary" onChange={(e) => update("teamSummary", e.target.value)}
            placeholder="Who is on your team? Roles, experience, strengths…" required />
        </div>

        <div>
          <label className="label" htmlFor="f-techStack">Tech stack</label>
          <input className="input" value={form.techStack} id="f-techStack" onChange={(e) => update("techStack", e.target.value)}
            placeholder="e.g. React, Node.js, TypeScript, MongoDB, Docker, AWS" required />
        </div>

        <div>
          <label className="label" htmlFor="f-revenueModel">Revenue model</label>
          <textarea className="input min-h-[80px]" value={form.revenueModel} id="f-revenueModel" onChange={(e) => update("revenueModel", e.target.value)}
            placeholder="How will you make money? Pricing tiers, B2B/B2C…" required />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary flex-1" disabled={loading}>
            {loading ? "Saving…" : editing ? "Save changes" : "Save idea"}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate(id ? `/ideas/${id}` : "/")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
