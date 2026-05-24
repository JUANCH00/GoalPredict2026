import { Link, NavLink, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

/** Nav sticky con backdrop-blur, brand-mark editorial y underline animado. */
export function Header() {
  const { user, isAuthenticated, isPremium, logout } = useAuth();
  const { pathname } = useLocation();

  const links = [
    { to: "/predict", label: "Dashboard" },
    { to: "/teams", label: "Equipos" },
    { to: "/pricing", label: "Planes" },
  ];

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link to="/" className="brand">
          <span className="brand-mark" />
          <span>
            GoalPredict <span className="serif-it">'26</span>
          </span>
        </Link>

        <div className="nav-links">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) => "nav-link"}
              data-active={pathname === l.to || pathname.startsWith(l.to + "/")}
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="nav-right">
          {isAuthenticated ? (
            <div className="row gap-3" style={{ alignItems: "center" }}>
              {isPremium && (
                <span className="tag accent dot" style={{ fontSize: 10 }}>
                  Premium
                </span>
              )}
              <div className="row gap-2" style={{ alignItems: "center" }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "var(--ink)",
                    color: "var(--bg)",
                    fontSize: 11,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                  title={user?.username}
                >
                  {user?.username.charAt(0)}
                </div>
                <button
                  className="nav-link"
                  onClick={logout}
                  style={{ fontSize: 13 }}
                >
                  Salir
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn ghost sm">
                Entrar
              </Link>
              <Link to="/predict" className="btn sm">
                Probar gratis
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
