"use client";

import { useRef, useState } from "react";
import { updateSettings } from "@/actions/settings";

type Photo = { src: string; alt: string };

async function compressImage(file: File, maxWidth = 2400, quality = 0.88): Promise<File> {
  if (file.size <= 3 * 1024 * 1024) return file;
  return new Promise((resolve) => {
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
        (blob) => resolve(blob ? new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }) : file),
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

async function uploadFile(file: File, type: "main" | "gallery"): Promise<string> {
  const processed = await compressImage(file);
  const fd = new FormData();
  fd.append("file", processed);
  fd.append("type", type);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const text = await res.text();
  let json: { src?: string; error?: string } = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(
      res.status === 413
        ? "La foto es demasiado pesada para el servidor (máx 4.5 MB)"
        : `Error del servidor (${res.status}): ${text.slice(0, 120) || "Respuesta vacía"}`
    );
  }
  if (!res.ok) throw new Error(json.error || `Error al subir (${res.status})`);
  return json.src as string;
}

function StatusMsg({ msg, error }: { msg: string; error?: boolean }) {
  if (!msg) return null;
  return (
    <p className={`text-sm mt-2 ${error ? "text-red-500" : "text-green-600"}`}>
      {msg}
    </p>
  );
}

// ─── Sección: Foto principal ─────────────────────────────────────────────────

function MainPhotoSection({ initial }: { initial: string }) {
  const [src, setSrc] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");
  const [isError, setIsError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setStatus("Subiendo...");
    setIsError(false);
    try {
      const newSrc = await uploadFile(file, "main");
      setSrc(newSrc);
      await updateSettings({ main_photo: newSrc });
      setStatus("✓ Foto principal actualizada");
    } catch (err) {
      setIsError(true);
      setStatus(err instanceof Error ? err.message : "Error al subir");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const preview = src || "/photos/main/foto2.jpg";

  return (
    <div className="bg-white rounded-lg border p-6 space-y-4">
      <h2 className="font-display text-lg text-wedding-dark border-b border-wedding-gold/20 pb-2">
        Foto principal (hero)
      </h2>

      {/* Preview */}
      <div
        className="w-full aspect-video rounded-lg overflow-hidden bg-wedding-dark bg-cover bg-center border border-wedding-gold/20"
        style={{ backgroundImage: `url('${preview}')` }}
      />

      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
          disabled={uploading}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 bg-wedding-gold text-white text-sm rounded hover:bg-wedding-gold/90 transition-colors disabled:opacity-50"
        >
          {uploading ? "Subiendo..." : "Cambiar foto principal"}
        </button>
        <StatusMsg msg={status} error={isError} />
        <p className="text-xs text-muted-foreground mt-2">
          JPG, PNG, WebP o AVIF · máximo 10 MB · se usa como fondo del hero
        </p>
      </div>
    </div>
  );
}

// ─── Sección: Galería ─────────────────────────────────────────────────────────

function GallerySection({ initial }: { initial: Photo[] }) {
  const [photos, setPhotos] = useState<Photo[]>(initial);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");
  const [isError, setIsError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function saveGallery(updated: Photo[]) {
    await updateSettings({ gallery_photos: JSON.stringify(updated) });
  }

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setStatus(`Subiendo ${files.length} foto${files.length > 1 ? "s" : ""}...`);
    setIsError(false);
    try {
      const newPhotos: Photo[] = [];
      for (const file of files) {
        const src = await uploadFile(file, "gallery");
        newPhotos.push({ src, alt: `Foto ${photos.length + newPhotos.length + 1}` });
      }
      const updated = [...photos, ...newPhotos];
      setPhotos(updated);
      await saveGallery(updated);
      setStatus(`✓ ${files.length} foto${files.length > 1 ? "s" : ""} agregada${files.length > 1 ? "s" : ""}`);
    } catch (err) {
      setIsError(true);
      setStatus(err instanceof Error ? err.message : "Error al subir");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function removePhoto(index: number) {
    const updated = photos.filter((_, i) => i !== index);
    setPhotos(updated);
    setStatus("");
    setIsError(false);
    try {
      await saveGallery(updated);
      setStatus("✓ Foto eliminada");
    } catch {
      setIsError(true);
      setStatus("Error al guardar cambios");
    }
  }

  async function movePhoto(index: number, direction: -1 | 1) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= photos.length) return;
    const updated = [...photos];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setPhotos(updated);
    setStatus("");
    try {
      await saveGallery(updated);
    } catch {
      setIsError(true);
      setStatus("Error al guardar orden");
    }
  }

  return (
    <div className="bg-white rounded-lg border p-6 space-y-4">
      <h2 className="font-display text-lg text-wedding-dark border-b border-wedding-gold/20 pb-2">
        Galería de fotos
      </h2>

      {photos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {photos.map((photo, i) => (
            <div key={photo.src + i} className="relative group aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full h-full object-cover rounded-lg border border-wedding-gold/20"
              />
              {/* Overlay con controles */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center gap-2">
                {/* Flechas de orden */}
                <div className="flex gap-1">
                  <button
                    onClick={() => movePhoto(i, -1)}
                    disabled={i === 0}
                    className="w-7 h-7 bg-white/20 hover:bg-white/40 text-white rounded text-sm disabled:opacity-30 transition-colors"
                    title="Mover a la izquierda"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => movePhoto(i, 1)}
                    disabled={i === photos.length - 1}
                    className="w-7 h-7 bg-white/20 hover:bg-white/40 text-white rounded text-sm disabled:opacity-30 transition-colors"
                    title="Mover a la derecha"
                  >
                    →
                  </button>
                </div>
                {/* Botón eliminar */}
                <button
                  onClick={() => removePhoto(i)}
                  className="w-7 h-7 bg-red-500/80 hover:bg-red-500 text-white rounded text-sm transition-colors"
                  title="Eliminar foto"
                >
                  ✕
                </button>
              </div>
              {/* Número */}
              <span className="absolute top-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-wedding-gold/20 rounded-lg py-12 text-center text-muted-foreground">
          <p className="text-3xl mb-2">📷</p>
          <p className="text-sm">Todavía no hay fotos en la galería</p>
        </div>
      )}

      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFiles}
          disabled={uploading}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 bg-wedding-gold text-white text-sm rounded hover:bg-wedding-gold/90 transition-colors disabled:opacity-50"
        >
          {uploading ? "Subiendo..." : "Agregar fotos"}
        </button>
        <StatusMsg msg={status} error={isError} />
        <p className="text-xs text-muted-foreground mt-2">
          Podés seleccionar varias fotos a la vez · JPG, PNG, WebP o AVIF · máx 10 MB c/u
        </p>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function FotosForm({
  initialMainPhoto,
  initialGallery,
}: {
  initialMainPhoto: string;
  initialGallery: Photo[];
}) {
  return (
    <div className="max-w-3xl space-y-6">
      <MainPhotoSection initial={initialMainPhoto} />
      <GallerySection initial={initialGallery} />
    </div>
  );
}
