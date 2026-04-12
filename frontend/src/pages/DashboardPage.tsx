import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ideasAPI } from "../services/api";
import { Lightbulb, ArrowRight, Loader2 } from "lucide-react";

interface Idea {
  _id: string;
  title: string;
  stage: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ideasAPI.list().then((res) => {
      const payload = res.data;
      setIdeas(payload.data ?? payload.data?.ideas ?? []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;

  const stageBadge = (stage: string) => {
    const colors: Record<string, string> = {
      idea: "bg-yellow-100 text-yellow-800",
      prototype: "bg-blue-100 text-blue-800",
      mvp: "bg-green-100 text-green-800",
      growth: "bg-purple-100 text-purple-800",
      scale: "bg-indigo-100 text-indigo-800",
    };
    return (
      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[stage] || "bg-gray-100 text-gray-700"}`}>
        {stage}
      </span>
    );
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Your Ideas</h1>
          <p className="text-sm text-gray-500">{ideas.length} idea{ideas.length !== 1 && "s"} in your portfolio</p>
        </div>
        <Link to="/ideas/new" className="btn-primary">
          + New Idea
        </Link>
      </div>

      {ideas.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-center">
          <Lightbulb className="mb-4 h-12 w-12 text-gray-300" />
          <h2 className="text-lg font-semibold text-gray-600">No ideas yet</h2>
          <p className="mb-6 text-sm text-gray-400">Submit your first startup idea to get AI-powered feedback</p>
          <Link to="/ideas/new" className="btn-primary">Create Your First Idea</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ideas.map((idea) => (
            <Link key={idea._id} to={`/ideas/${idea._id}`} className="card group transition hover:shadow-md hover:border-brand-300">
              <div className="mb-3 flex items-start justify-between">
                <h3 className="font-semibold text-gray-900 group-hover:text-brand-700 line-clamp-2">{idea.title}</h3>
                <ArrowRight className="ml-2 h-4 w-4 shrink-0 text-gray-300 transition group-hover:text-brand-500" />
              </div>
              <div className="flex items-center gap-2">
                {stageBadge(idea.stage)}
                <span className="text-xs text-gray-400">{new Date(idea.createdAt).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
