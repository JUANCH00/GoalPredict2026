import { Link, NavLink } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export function Header() {
  const { user, isAuthenticated, isPremium, logout } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl">⚽</span>
          <span className="font-display font-bold text-xl text-slate-900 group-hover:text-brand-600 transition-colors">
            GoalPredict <span className="text-brand-500">2026</span>
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${
                isActive ? "text-brand-600" : "text-slate-600 hover:text-slate-900"
              }`
            }
          >
            Predicción
          </NavLink>
          <NavLink
            to="/teams"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${
                isActive ? "text-brand-600" : "text-slate-600 hover:text-slate-900"
              }`
            }
          >
            Equipos
          </NavLink>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-700">
                <span className="font-medium">{user?.username}</span>
                <span
                  className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                    isPremium
                      ? "bg-amber-100 text-amber-800"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {isPremium ? "★ Premium" : "Free"}
                </span>
              </span>
              <button
                onClick={logout}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Salir
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Iniciar sesión
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
