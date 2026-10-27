import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthShell from "../components/AuthShell";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || "Connexion impossible. Vérifie ton e-mail et ton mot de passe.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Bon retour" subtitle="Connecte-toi pour retrouver tes idées et tes rapports.">
      {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="login-email">E-mail</label>
          <input id="login-email" type="email" autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="label" htmlFor="login-password">Mot de passe</label>
          <input id="login-password" type="password" autoComplete="current-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        Pas encore de compte ?{" "}
        <Link to="/register" className="font-semibold text-brand-600 hover:underline">
          Créer un compte
        </Link>
      </p>
    </AuthShell>
  );
}
