import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, AlertCircle, History } from "lucide-react";
import { api, getImageUrl } from "../services/api";

export default function Result() {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("lastAnalysis");
    if (saved) setResult(JSON.parse(saved));
  }, []);

  const saveAnalysis = async () => {
    if (!result) return;

    if (result.saved) {
      alert("Este análisis ya fue guardado.");
      return;
    }

    try {
      setSaving(true);
      const response = await api.post("/save-analysis", result);

      const updated = { ...result, id: response.data.id, saved: true };
      setResult(updated);
      localStorage.setItem("lastAnalysis", JSON.stringify(updated));

      alert("Análisis guardado correctamente.");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.detail || "No se pudo guardar el análisis.");
    } finally {
      setSaving(false);
    }
  };

  if (!result) {
    return (
      <div className="bg-white rounded-3xl shadow p-8 text-center">
        <AlertCircle className="mx-auto text-orange-500 mb-3" size={44} />
        <h2 className="text-xl font-bold mb-2">No hay análisis disponible</h2>
        <p className="text-slate-500 mb-4">
          Realiza un análisis desde la pantalla de inicio.
        </p>
        <button onClick={() => navigate("/")} className="bg-green-700 text-white px-5 py-3 rounded-2xl">
          Ir al inicio
        </button>
      </div>
    );
  }

  const colorMap = {
    green: "bg-green-100 text-green-800 border-green-300",
    orange: "bg-orange-100 text-orange-800 border-orange-300",
    red: "bg-red-100 text-red-800 border-red-300",
  };

  const severityBarColor =
    result.severity_color === "green"
      ? "#16a34a"
      : result.severity_color === "orange"
      ? "#f97316"
      : "#dc2626";

  return (
    <section>
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 bg-slate-800 text-white px-4 py-3 rounded-2xl hover:bg-slate-900"
        >
          <ArrowLeft size={18} />
          Subir otra foto
        </button>

        <button
          onClick={saveAnalysis}
          disabled={saving || result.saved}
          className="flex items-center gap-2 bg-green-700 text-white px-4 py-3 rounded-2xl disabled:opacity-50 hover:bg-green-800"
        >
          <Save size={18} />
          {result.saved ? "Guardado" : saving ? "Guardando..." : "Guardar análisis"}
        </button>

        <button
          onClick={() => navigate("/history")}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-3 rounded-2xl hover:bg-orange-600"
        >
          <History size={18} />
          Ver historial
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl shadow p-4">
          <h2 className="font-bold text-lg mb-4">Resultado visual</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500 mb-2">Imagen original</p>
              <img src={getImageUrl(result.original_image_url)} alt="Original" className="rounded-2xl w-full object-contain border" />
            </div>

            <div>
              <p className="text-sm text-slate-500 mb-2">Segmentación</p>
              <img src={getImageUrl(result.overlay_image_url)} alt="Overlay" className="rounded-2xl w-full object-contain border" />
            </div>
          </div>

          <div className="mt-4 p-4 rounded-2xl bg-slate-50 border text-sm text-slate-600">
            La severidad corresponde a la proporción de píxeles clasificados como
            lesión respecto al total de píxeles de la hoja segmentada.
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Resultado del análisis</h1>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-100">
              <p className="text-sm text-slate-500">Clase predicha</p>
              <p className="text-2xl font-bold capitalize">{result.class_name}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-100">
              <p className="text-sm text-slate-500">Confianza</p>
              <p className="text-2xl font-bold">{result.confidence}%</p>
              <div className="w-full bg-slate-200 rounded-full h-3 mt-3">
                <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${Math.min(result.confidence, 100)}%` }} />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-100">
              <p className="text-sm text-slate-500">Severidad estimada</p>
              <p className="text-2xl font-bold">{result.severity}%</p>
              <div className="w-full bg-slate-200 rounded-full h-3 mt-3">
                <div
                  className="h-3 rounded-full"
                  style={{
                    width: `${Math.min(result.severity, 100)}%`,
                    backgroundColor: severityBarColor,
                  }}
                />
              </div>
            </div>

            <div className={`p-4 rounded-2xl border ${colorMap[result.severity_color] || "bg-slate-100"}`}>
              <p className="text-sm">Nivel de severidad</p>
              <p className="text-2xl font-bold capitalize">{result.severity_level}</p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-600 mb-1">Recomendación</p>
              <p className="text-blue-900">{result.recommendation}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}