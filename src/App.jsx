import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { Leaf, History, Home as HomeIcon, ScanLine } from "lucide-react";
import Home from "./pages/Home";
import Result from "./pages/Result";
import HistoryPage from "./pages/History";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-100 text-slate-900">
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-lg">
              <Leaf className="text-green-700" />
              <span>Visión Café</span>
            </div>

            <nav className="flex gap-2 text-sm">
              <NavLink to="/" className={({ isActive }) => `px-3 py-2 rounded-xl flex items-center gap-1 ${isActive ? "bg-green-700 text-white" : "hover:bg-slate-100"}`}>
                <HomeIcon size={16} />
                Inicio
              </NavLink>

              <NavLink to="/result" className={({ isActive }) => `px-3 py-2 rounded-xl flex items-center gap-1 ${isActive ? "bg-green-700 text-white" : "hover:bg-slate-100"}`}>
                <ScanLine size={16} />
                Análisis
              </NavLink>

              <NavLink to="/history" className={({ isActive }) => `px-3 py-2 rounded-xl flex items-center gap-1 ${isActive ? "bg-green-700 text-white" : "hover:bg-slate-100"}`}>
                <History size={16} />
                Historial
              </NavLink>
            </nav>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/result" element={<Result />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}