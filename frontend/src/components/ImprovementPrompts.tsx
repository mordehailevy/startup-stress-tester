import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Copy, ChevronDown, Pencil, ExternalLink } from "lucide-react";
import { buildCoachPrompts, fieldLabel, IdeaDossier, PanelFeedback, PromptLang } from "../lib/coachPrompts";
import { Scores, scoreText } from "../lib/score";

interface Props {
  ideaId: string;
  idea: IdeaDossier;
  overall: number;
  scores: Scores;
  feedbacks: PanelFeedback[];
}

const UI = {
  fr: {
    heading: "Prompts pour gagner des points",
    intro:
      "Copie un prompt dans ton assistant IA, réponds à ses questions, colle les champs réécrits dans ton idée, puis relance le stress test.",
    copy: "Copier le prompt",
    copied: "Copié",
    show: "Voir le prompt",
    hide: "Masquer",
    edit: "Modifier ces champs",
    rewrites: "Réécrit",
    openIn: "Ouvrir dans",
  },
  en: {
    heading: "Prompts to raise your score",
    intro: "Paste a prompt into your AI assistant, answer its questions, paste the rewritten fields into your idea, then run the stress test again.",
    copy: "Copy prompt",
    copied: "Copied",
    show: "Show prompt",
    hide: "Hide",
    edit: "Edit these fields",
    rewrites: "Rewrites",
    openIn: "Open in",
  },
} as const;

function defaultLang(): PromptLang {
  try {
    const saved = localStorage.getItem("sst-prompt-lang");
    if (saved === "fr" || saved === "en") return saved;
  } catch {
    /* storage unavailable */
  }
  return navigator.language?.toLowerCase().startsWith("fr") ? "fr" : "en";
}

export default function ImprovementPrompts({ ideaId, idea, overall, scores, feedbacks }: Props) {
  const [lang, setLang] = useState<PromptLang>(defaultLang);
  const [open, setOpen] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const t = UI[lang];

  const prompts = useMemo(() => buildCoachPrompts(idea, overall, scores, feedbacks, lang), [idea, overall, scores, feedbacks, lang]);

  const chooseLang = (l: PromptLang) => {
    setLang(l);
    try {
      localStorage.setItem("sst-prompt-lang", l);
    } catch {
      /* storage unavailable */
    }
  };

  const copy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for browsers without async clipboard access.
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(id);
    setTimeout(() => setCopied((c) => (c === id ? null : c)), 2000);
  };

  return (
    <section className="card mb-6 print:hidden">
      <div className="mb-1 flex flex-wrap items-start justify-between gap-3">
        <h2 className="font-display text-xl font-bold">{t.heading}</h2>
        <div className="inline-flex rounded-lg border border-gray-200 p-0.5 text-xs font-semibold" role="group" aria-label="Prompt language">
          {(["fr", "en"] as const).map((l) => (
            <button
              key={l}
              onClick={() => chooseLang(l)}
              aria-pressed={lang === l}
              className={`rounded-md px-2.5 py-1 ${lang === l ? "bg-brand-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <p className="mb-5 max-w-2xl text-sm text-gray-600">{t.intro}</p>

      <ul className="space-y-3">
        {prompts.map((p) => {
          const isOpen = open === p.id;
          const isCopied = copied === p.id;
          const q = encodeURIComponent(p.text);
          return (
            <li key={p.id} className="rounded-xl border border-gray-200">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <h3 className="font-semibold text-gray-900">{p.title}</h3>
                    {p.score !== null && <span className={`font-display text-lg font-extrabold ${scoreText(p.score)}`}>{p.score}</span>}
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {t.rewrites} : {p.fields.map((f) => fieldLabel(f, lang)).join(", ")}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={() => copy(p.id, p.text)} className="btn-primary gap-1.5 px-3 py-2 text-xs" aria-live="polite">
                    {isCopied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                    {isCopied ? t.copied : t.copy}
                  </button>
                  <button
                    onClick={() => setOpen(isOpen ? null : p.id)}
                    aria-expanded={isOpen}
                    aria-controls={`prompt-${p.id}`}
                    className="btn-secondary gap-1 px-3 py-2 text-xs"
                  >
                    {isOpen ? t.hide : t.show}
                    <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                  </button>
                </div>
              </div>

              {isOpen && (
                <div id={`prompt-${p.id}`} className="border-t border-gray-100 p-4">
                  <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-gray-50 p-4 font-sans text-[13px] leading-relaxed text-gray-800">{p.text}</pre>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                    <a href={`https://claude.ai/new?q=${q}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-brand-700 hover:underline">
                      {t.openIn} Claude <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                    <a href={`https://chatgpt.com/?q=${q}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-brand-700 hover:underline">
                      {t.openIn} ChatGPT <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                    <Link to={`/ideas/${ideaId}/edit?focus=${p.fields[0]}`} className="ml-auto inline-flex items-center gap-1 font-medium text-gray-700 hover:text-brand-700">
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> {t.edit}
                    </Link>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
