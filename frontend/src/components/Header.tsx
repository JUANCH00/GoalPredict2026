import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

/** Nav sticky con backdrop-blur, brand-mark editorial y underline animado.
 *  En <760px colapsa los links + auth a un menú hamburguesa.
 */
export function Header() {
  const { user, isAuthenticated, isPremium, logout } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  // Cerrar el menú al navegar
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Bloquear scroll del body cuando el menú móvil está abierto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const links = [
    { to: "/predict", label: "Dashboard" },
    { to: "/teams", label: "Equipos" },
    { to: "/pricing", label: "Planes" },
  ];

  const isLinkActive = (to: string) =>
    pathname === to || pathname.startsWith(to + "/");

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <Link to="/" className="brand">
            <span className="brand-mark" />
            <span>
              GoalPredict <span className="serif-it">'26</span>
            </span>
          </Link>

          {/* Desktop nav-links */}
          <div className="nav-links">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className="nav-link"
                data-active={isLinkActive(l.to)}
              >
                {l.label}
              </NavLink>
            ))}
          </div>

          {/* Desktop auth area */}
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

          {/* Mobile hamburger */}
          <button
            className="nav-burger"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <span className={`burger-icon${open ? " open" : ""}`}>
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile menu panel */}
      <div className={`nav-mobile${open ? " open" : ""}`} aria-hidden={!open}>
        <div className="nav-mobile-inner">
          <div className="col gap-2">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="nav-mobile-link"
                data-active={isLinkActive(l.to)}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div
            className="col gap-3"
            style={{
              marginTop: 28,
              paddingTop: 24,
              borderTop: "1px solid var(--line)",
            }}
          >
            {isAuthenticated ? (
              <>
                <div className="row between" style={{ alignItems: "center" }}>
                  <div className="row gap-3" style={{ alignItems: "center" }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: "var(--ink)",
                        color: "var(--bg)",
                        fontSize: 14,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 600,
                        textTransform: "uppercase",
                      }}
                    >
                      {user?.username.charAt(0)}
                    </div>
                    <div className="col" style={{ gap: 2 }}>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>
                        {user?.username}
                      </div>
                      <div
                        className="mono"
                        style={{
                          fontSize: 10,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: isPremium ? "var(--accent)" : "var(--ink-mute)",
                        }}
                      >
                        {isPremium ? "★ Premium" : "Free"}
                      </div>
                    </div>
                  </div>
                  <button
                    className="btn ghost sm"
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                  >
                    Salir
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn ghost"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Entrar
                </Link>
                <Link
                  to="/predict"
                  className="btn"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Probar gratis
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
