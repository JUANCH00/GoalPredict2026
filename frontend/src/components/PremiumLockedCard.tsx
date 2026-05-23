import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export function PremiumLockedCard() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="bg-gradient-to-br from-amber-50 to-amber-100 ring-2 ring-amber-300 rounded-2xl p-8 text-center">
      <div className="text-5xl mb-3">🔒</div>
      <h3 className="font-display font-bold text-2xl text-slate-900">Estadísticas Premium</h3>
      <p className="text-slate-700 mt-2 max-w-md mx-auto">
        Desbloquea predicciones avanzadas: goles esperados por tiempo, tarjetas, tiros de esquina,
        posesión y comparativa de estilo de juego.
      </p>

      <div className="mt-6">
        {isAuthenticated && user?.tier === "free" ? (
          <div className="space-y-2">
            <p className="text-sm text-amber-800 font-medium">
              Estás logueado como <span className="font-bold">{user.username}</span> (tier free).
            </p>
            <p className="text-sm text-amber-800">
              Para esta demo, inicia sesión con <code className="bg-white px-2 py-0.5 rounded">premium_user</code> /{" "}
              <code className="bg-white px-2 py-0.5 rounded">premium123</code>.
            </p>
            <Link
              to="/login"
              className="inline-block mt-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              Cambiar de cuenta
            </Link>
          </div>
        ) : (
          <Link
            to="/login"
            className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
          >
            Iniciar sesión Premium
          </Link>
        )}
      </div>
    </div>
  );
}
