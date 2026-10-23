"use client";

import { useState, useEffect } from "react";
import { createGuestPhoto } from "@/actions/guest-photos";

async function compressImage(file: File, maxWidth = 1920, quality = 0.9): Promise<File> {
  return new Promise(resolve => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        blob => resolve(blob ? new File([blob], "foto.jpg", { type: "image/jpeg" }) : file),
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

const hiddenInput: React.CSSProperties = {
  position: "absolute",
  opacity: 0,
  width: "1px",
  height: "1px",
  overflow: "hidden",
};

export default function FotosUploadClient({
  brideName,
  groomName,
  requireApproval,
}: {
  brideName?: string;
  groomName?: string;
  requireApproval: boolean;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "compressing" | "uploading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [showSafariHint, setShowSafariHint] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/.test(ua);
    const isSafari = isIOS && /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS/.test(ua);
    setShowSafariHint(isIOS && !isSafari);
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStatus("idle");
    setErrorMsg("");
    e.target.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !name.trim() || status === "uploading" || status === "compressing") return;

    setStatus("compressing");
    setErrorMsg("");

    try {
      const compressed = await compressImage(file);

      setStatus("uploading");
      const fd = new FormData();
      fd.append("file", compressed);
      const res = await fetch("/api/fotos/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al subir");

      const result = await createGuestPhoto({
        guest_name: name.trim(),
        description: description.trim(),
        photo_url: json.src,
      });
      if (!result.success) throw new Error(result.error || "Error al guardar");

      setStatus("success");
    } catch (err) {
      setStatus("error");
      // eslint-disable-next-line no-console
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : "Error inesperado");
    }
  }

  function reset() {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setName("");
    setDescription("");
    setStatus("idle");
    setErrorMsg("");
  }

  const coupleNames = brideName && groomName ? `${brideName} & ${groomName}` : "la boda";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(160deg, #1A1A1A 0%, #2C2518 60%, #1A1A1A 100%)" }}
    >
      <div className="text-center pt-10 pb-4 px-4">
        <p className="text-wedding-gold text-xs uppercase tracking-[0.3em] mb-2">
          Compartí un momento
        </p>
        <h1 className="font-display text-3xl text-white">{coupleNames}</h1>
      </div>

      <div className="flex-1 px-4 pb-10 max-w-md mx-auto w-full">
        {status === "success" ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-wedding-gold/20 flex items-center justify-center text-4xl">
              📸
            </div>
            <div>
              <p className="font-display text-2xl text-white mb-1">¡Gracias!</p>
              <p className="text-white/60 text-sm">
                {requireApproval
                  ? "Tu foto fue enviada y pronto aparecerá en el slideshow"
                  : "Tu foto ya está en el slideshow"}
              </p>
            </div>
            <button
              onClick={reset}
              className="mt-2 px-6 py-2.5 bg-wedding-gold text-white rounded-full text-sm font-medium hover:bg-wedding-gold/90 transition-colors"
            >
              Subir otra foto
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning>

            {/* Área de foto */}
            <label
              htmlFor="photo-input"
              className={`relative flex w-full aspect-[4/3] rounded-2xl overflow-hidden border-2 transition-colors cursor-pointer ${
                preview ? "border-wedding-gold/30" : "border-white/15 active:border-white/40"
              }`}
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Vista previa" className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/40">
                  <span className="text-6xl">📷</span>
                  <p className="text-sm">Tocá para sacar o elegir una foto</p>
                </div>
              )}
              {preview && (
                <div className="absolute inset-x-0 bottom-0 flex justify-center pb-3">
                  <span className="text-xs text-white/50 bg-black/30 px-2 py-0.5 rounded-full">
                    Tocá para cambiar
                  </span>
                </div>
              )}
            </label>

            <input
              id="photo-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={hiddenInput}
            />

            {/* Nombre */}
            <div className="space-y-1.5">
              <label htmlFor="guest-name" className="text-white/70 text-sm">Tu nombre *</label>
              <input
                id="guest-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="¿Cómo te llamás?"
                required
                maxLength={60}
                suppressHydrationWarning
                className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-wedding-gold/50 transition-colors"
              />
            </div>

            {/* Descripción */}
            <div className="space-y-1.5">
              <label htmlFor="guest-desc" className="text-white/70 text-sm">Descripción (opcional)</label>
              <textarea
                id="guest-desc"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="¿Qué momento es este?"
                rows={2}
                maxLength={120}
                suppressHydrationWarning
                className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-wedding-gold/50 transition-colors resize-none"
              />
            </div>

            {errorMsg && (
              <p className="text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
                      disabled={!file || !name.trim() || status === "compressing" || status === "uploading"}
              className="w-full py-3.5 bg-wedding-gold text-white rounded-xl font-medium text-base disabled:opacity-40 hover:bg-wedding-gold/90 active:scale-[0.98] transition-all"
            >
              {status === "compressing" ? "Procesando..." : status === "uploading" ? "Enviando..." : "Enviar foto"}
            </button>
          </form>
        )}
      </div>

      {showSafariHint && (
        <div className="px-4 pb-6 max-w-md mx-auto w-full">
          <p className="text-center text-white/30 text-xs leading-relaxed">
             Para una mejor experiencia con la cámara, abrí esta página en{" "}
            <span className="text-white/50">Safari</span>, o seleccioná las fotos desde la galería.
          </p>
        </div>
      )}
    </div>
  );
}
