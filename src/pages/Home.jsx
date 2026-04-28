import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Camera, Loader2, X, Circle, Leaf } from "lucide-react";
import { api } from "../services/api";

export default function Home() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
        },
        audio: false,
      });

      streamRef.current = stream;
      setCameraOpen(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (error) {
      console.error(error);
      alert("No se pudo acceder a la cámara. Revisa permisos del navegador.");
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setCameraOpen(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        const file = new File([blob], `foto_${Date.now()}.jpg`, {
          type: "image/jpeg",
        });

        handleFile(file);
        closeCamera();
      },
      "image/jpeg",
      0.95
    );
  };

  const analyzeImage = async () => {
    if (!selectedFile) {
      alert("Primero selecciona o toma una imagen.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await api.post("/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      localStorage.setItem("lastAnalysis", JSON.stringify(response.data));
      navigate("/result");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.detail || "Ocurrió un error al analizar la imagen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="grid md:grid-cols-2 gap-8 items-center">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Clasificación y severidad en hojas de café
        </h1>

        <p className="text-slate-600 mb-6">
          Sube una imagen o toma una fotografía de una hoja para estimar la
          enfermedad, visualizar la segmentación y calcular la severidad del daño.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => fileInputRef.current.click()}
            className="bg-green-700 text-white px-5 py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-green-800"
          >
            <Upload size={20} />
            Subir imagen
          </button>

          <button
            onClick={openCamera}
            className="bg-slate-800 text-white px-5 py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-900"
          >
            <Camera size={20} />
            Tomar foto
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => handleFile(e.target.files[0])}
        />

        <button
          onClick={analyzeImage}
          disabled={loading || !selectedFile}
          className="mt-6 w-full sm:w-auto bg-orange-500 text-white px-6 py-3 rounded-2xl disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-orange-600"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Analizando...
            </>
          ) : (
            "Analizar imagen"
          )}
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow p-4 min-h-[360px] flex items-center justify-center">
        {preview ? (
          <img
            src={preview}
            alt="Vista previa"
            className="max-h-[420px] rounded-2xl object-contain"
          />
        ) : (
          <div className="text-center text-slate-400">
            <Upload className="mx-auto mb-3" size={48} />
            <p>La vista previa aparecerá aquí.</p>
          </div>
        )}
      </div>

      {cameraOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-4 relative">
            <button
              onClick={closeCamera}
              className="absolute top-4 right-4 bg-white/90 p-2 rounded-full z-10 hover:bg-slate-100"
            >
              <X size={22} />
            </button>

            <h2 className="text-xl font-bold mb-4">Tomar fotografía</h2>

            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-2xl bg-black max-h-[70vh] object-contain"
            />

            <button
              onClick={capturePhoto}
              className="mt-4 w-full bg-green-700 text-white px-5 py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-green-800"
            >
              <Circle size={18} />
              Capturar foto
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-xl">
            <div className="mx-auto mb-5 w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-pulse">
              <Leaf className="text-green-700" size={44} />
            </div>

            <h2 className="text-2xl font-bold mb-2">Procesando imagen</h2>

            <p className="text-slate-500 mb-5">
              Analizando la hoja de café, generando segmentación y calculando severidad.
            </p>

            <div className="flex justify-center">
              <Loader2 className="animate-spin text-green-700" size={34} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}