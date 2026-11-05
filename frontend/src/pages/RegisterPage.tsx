import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthShell from "../components/AuthShell";

export default function RegisterPage() {
  const { register, claimDemo, user } = useAuth();
  // From the demo, signing up keeps everything the visitor did there.
  const fromDemo = Boolean(user?.isDemo);
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (fromDemo) await claimDemo(email, password, fullName);
      else await register(email, password, fullName);
      navigate("/");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || "Inscription impossible. Vérifie les champs et réessaie.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={fromDemo ? "Garde ta démo" : "Crée ton compte"}
      subtitle={
        fromDemo
          ? "Tes idées, tes rapports et tes modifications de la démo passent dans ton compte."
          : "Ajoute tes propres idées et suis leur score au fil de tes versions."
      }
    >
      {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="reg-name">Nom</label>
          <input id="reg-name" type="text" autoComplete="name" className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div>
          <label className="label" htmlFor="reg-email">E-mail</label>
          <input id="reg-email" type="email" autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="label" htmlFor="reg-password">Mot de passe (8 caractères minimum)</label>
          <input id="reg-password" type="password" autoComplete="new-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Création du compte…" : fromDemo ? "Créer mon compte et garder mes idées" : "Créer mon compte"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        Déjà un compte ?{" "}
        <Link to="/login" className="font-semibold text-brand-600 hover:underline">
          Se connecter
        </Link>
      </p>
    </AuthShell>
  );
}
