import { useEffect, useState } from "react";
import { Trash2, RefreshCw, X } from "lucide-react";
import { api, getImageUrl } from "../services/api";
import { toast } from "sonner";

export default function HistoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get("/history");
      setItems(response.data);
    } catch (error) {
      console.error(error);
      toast.error("No se pudo cargar el historial");
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async () => {
    if (!deleteId) return;

    try {
      await api.delete(`/history/${deleteId}`);
      setItems((prev) => prev.filter((item) => item.id !== deleteId));
      setSelected(null);

      toast.success("Análisis eliminado correctamente");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.detail || "No se pudo eliminar el análisis");
    } finally {
      setDeleteId(null);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <section>
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Historial de análisis</h1>
          <p className="text-slate-500">Consulta las imágenes procesadas y sus resultados.</p>
        </div>

        <button onClick={loadHistory} className="bg-slate-800 text-white px-4 py-2 rounded-xl flex items-center gap-2">
          <RefreshCw size={18} />
          Actualizar
        </button>
      </div>

      {loading ? (
        <p>Cargando historial...</p>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-3xl shadow p-8 text-center text-slate-500">
          No hay análisis guardados.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <article key={item.id} className="bg-white rounded-3xl shadow overflow-hidden cursor-pointer hover:shadow-lg transition" onClick={() => setSelected(item)}>
              <img src={getImageUrl(item.overlay_image_url)} alt={item.class_name} className="w-full h-56 object-cover" />

              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-xl capitalize">{item.class_name}</h2>
                  <span className="text-sm bg-slate-100 px-3 py-1 rounded-full">{item.confidence}%</span>
                </div>

                <p className="text-sm text-slate-600">
                  Severidad: <b>{item.severity}%</b>
                </p>

                <p className="text-sm capitalize">
                  Nivel: <b>{item.severity_level}</b>
                </p>

                <p className="text-xs text-slate-400">
                  {new Date(item.created_at).toLocaleString()}
                </p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteItem(item.id);
                  }}
                  className="mt-3 w-full border border-red-200 text-red-600 px-4 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 bg-slate-100 p-2 rounded-full hover:bg-slate-200">
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold mb-6">Detalle del análisis</h2>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 mb-2">Imagen original</p>
                  <img src={getImageUrl(selected.original_image_url)} className="rounded-2xl border w-full" />
                </div>

                <div>
                  <p className="text-sm text-slate-500 mb-2">Segmentación</p>
                  <img src={getImageUrl(selected.overlay_image_url)} className="rounded-2xl border w-full" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-slate-100 rounded-2xl">
                  <p className="text-sm text-slate-500">Clase</p>
                  <p className="text-2xl font-bold capitalize">{selected.class_name}</p>
                </div>

                <div className="p-4 bg-slate-100 rounded-2xl">
                  <p className="text-sm text-slate-500">Confianza</p>
                  <p className="text-2xl font-bold">{selected.confidence}%</p>
                </div>

                <div className="p-4 bg-slate-100 rounded-2xl">
                  <p className="text-sm text-slate-500">Severidad</p>
                  <p className="text-2xl font-bold">{selected.severity}%</p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                  <p className="text-sm text-blue-600">Recomendación</p>
                  <p className="text-blue-900">{selected.recommendation}</p>
                </div>

                <button
                  onClick={() => setDeleteId(item.id)}
                  className="w-full border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                  Eliminar análisis
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}