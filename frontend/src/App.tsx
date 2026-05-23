import { Route, Routes } from "react-router-dom";

import { Header } from "./components/Header";
import { AuthProvider } from "./context/AuthContext";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { PredictionPage } from "./pages/PredictionPage";
import { TeamsPage } from "./pages/TeamsPage";

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/predict" element={<PredictionPage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </main>
        <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          GoalPredict 2026 — Proyecto académico UPTC · Ingeniería de Sistemas
        </footer>
      </div>
    </AuthProvider>
  );
}
