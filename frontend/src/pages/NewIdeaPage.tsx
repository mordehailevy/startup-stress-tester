import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ideasAPI, IdeaPayload } from "../services/api";

const STAGES = [
  { value: "idea", label: "💡 Idea" },
  { value: "prototype", label: "🔧 Prototype" },
  { value: "mvp", label: "🚀 MVP" },
  { value: "growth", label: "📈 Growth" },
  { value: "scale", label: "🏢 Scale" },
];

export default function NewIdeaPage() {
  const navigate = useNavigate();
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

  const update = (field: keyof IdeaPayload, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await ideasAPI.create(form);
      navigate(`/ideas/${res.data.data.idea._id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || "Failed to create idea";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Submit a New Startup Idea</h1>

      {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="label">Project Title</label>
          <input className="input" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. EcoTrack — Carbon Tracker for SMBs" required />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea className="input min-h-[120px]" value={form.description} onChange={(e) => update("description", e.target.value)}
            placeholder="Describe the problem you're solving, your solution, and what makes it unique…" required />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Market Size Estimate</label>
            <input className="input" value={form.marketSizeEstimate} onChange={(e) => update("marketSizeEstimate", e.target.value)}
              placeholder="e.g. $12B global market, 22% CAGR" required />
          </div>
          <div>
            <label className="label">Stage</label>
            <select className="input" value={form.stage} onChange={(e) => update("stage", e.target.value)}>
              {STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Team Summary</label>
          <textarea className="input min-h-[80px]" value={form.teamSummary} onChange={(e) => update("teamSummary", e.target.value)}
            placeholder="Who is on your team? Roles, experience, strengths…" required />
        </div>

        <div>
          <label className="label">Tech Stack</label>
          <input className="input" value={form.techStack} onChange={(e) => update("techStack", e.target.value)}
            placeholder="e.g. React, Node.js, TypeScript, MongoDB, Docker, AWS" required />
        </div>

        <div>
          <label className="label">Revenue Model</label>
          <textarea className="input min-h-[80px]" value={form.revenueModel} onChange={(e) => update("revenueModel", e.target.value)}
            placeholder="How will you make money? Pricing tiers, B2B/B2C…" required />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary flex-1" disabled={loading}>
            {loading ? "Saving…" : "Save Idea"}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate("/")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
