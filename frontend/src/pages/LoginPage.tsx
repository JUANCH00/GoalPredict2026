import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de autenticación");
    } finally {
      setLoading(false);
    }
  };

  const setDemo = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h1 className="font-display font-bold text-2xl text-slate-900 text-center">
          Iniciar sesión
        </h1>
        <p className="text-sm text-slate-500 text-center mt-1">
          Accede a las predicciones premium
        </p>

        {error && (
          <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg px-4 py-2.5 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
              Usuario
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-brand-500 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-brand-500 focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? "Entrando..." : "Iniciar sesión"}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-200">
          <p className="text-xs text-slate-500 mb-2 text-center">Cuentas demo:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDemo("free_user", "free123")}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-3 rounded-lg transition-colors"
            >
              <div className="font-semibold">Free</div>
              <div className="text-slate-500">free_user / free123</div>
            </button>
            <button
              type="button"
              onClick={() => setDemo("premium_user", "premium123")}
              className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 py-2 px-3 rounded-lg transition-colors"
            >
              <div className="font-semibold">★ Premium</div>
              <div className="text-amber-800">premium_user / premium123</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
