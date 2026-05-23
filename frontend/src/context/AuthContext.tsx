import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import * as api from "../services/api";
import type { UserInfo } from "../types/api";

interface AuthContextValue {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isPremium: boolean;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Al montar: si hay un token en localStorage, validarlo con /auth/me
  useEffect(() => {
    const token = api.getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .fetchMe()
      .then((u) => setUser(u))
      .catch(() => {
        // Token inválido/expirado
        api.logout();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setError(null);
    try {
      await api.login(username, password);
      const u = await api.fetchMe();
      setUser(u);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Error desconocido";
      setError(message);
      throw e;
    }
  }, []);

  const logout = useCallback(() => {
    api.logout();
    setUser(null);
  }, []);

  const value: AuthContextValue = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      isPremium: user?.tier === "premium",
      loading,
      error,
      login,
      logout,
    }),
    [user, loading, error, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return ctx;
}
