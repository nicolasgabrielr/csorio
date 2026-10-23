"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from "react-qr-code";
import { updateSettings } from "@/actions/settings";
import { updateGuestPhotoStatus, deleteGuestPhoto } from "@/actions/guest-photos";
import type { GuestPhoto } from "@/actions/guest-photos";
import NextImage from "next/image";

type Filter = "all" | "pending" | "approved";

function QRSection() {
  const [fotosUrl, setFotosUrl] = useState<string | null>(null);
  const [customUrl, setCustomUrl] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const base = window.location.origin + "/fotos";
    setFotosUrl(base);
    setCustomUrl(base);
  }, []);

  function handleDownload() {
    const svg = containerRef.current?.querySelector("svg");
    if (!svg || !customUrl) return;

    const SIZE = 512;
    const svgString = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, SIZE, SIZE);
      ctx.drawImage(img, 0, 0, SIZE, SIZE);
      URL.revokeObjectURL(svgUrl);

      canvas.toBlob(pngBlob => {
        if (!pngBlob) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(pngBlob);
        a.download = "qr-fotos-invitados.png";
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      }, "image/png");
    };
    img.src = svgUrl;
  }

  return (
    <div className="bg-white rounded-lg border p-5 flex items-start gap-6">
      <div
        ref={containerRef}
        className="bg-white p-3 border border-gray-100 rounded-xl shadow-sm flex-shrink-0"
      >
        {customUrl && <QRCode value={customUrl} size={148} />}
      </div>

      <div className="flex-1 space-y-3 min-w-0">
        <div>
          <p className="font-medium text-wedding-dark text-sm">QR para invitados</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Imprimí uno por mesa para que suban fotos desde el celular.
          </p>
        </div>
        {fotosUrl && (
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">URL del QR</label>
            <input
              type="text"
              value={customUrl}
              onChange={e => setCustomUrl(e.target.value)}
              className="w-full text-xs bg-muted border border-transparent focus:border-wedding-gold/40 px-2.5 py-1.5 rounded focus:outline-none transition-colors"
            />
          </div>
        )}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleDownload}
            disabled={!customUrl}
            className="px-4 py-2 bg-wedding-gold text-white text-sm rounded-lg hover:bg-wedding-gold/90 transition-colors disabled:opacity-50"
          >
            Descargar PNG
          </button>
          <a
            href="/fotos/slideshow"
            target="_blank"
            className="text-sm text-muted-foreground hover:text-wedding-dark transition-colors"
          >
            Ver slideshow →
          </a>
        </div>
      </div>
    </div>
  );
}

export default function FotosInvitadosClient({
  initialPhotos,
  requireApproval,
}: {
  initialPhotos: GuestPhoto[];
  requireApproval: boolean;
}) {
  const [photos, setPhotos] = useState<GuestPhoto[]>(initialPhotos);
  const [approval, setApproval] = useState(requireApproval);
  const [filter, setFilter] = useState<Filter>("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function toggleApproval(val: boolean) {
    setApproval(val);
    await updateSettings({ photos_require_approval: val ? "true" : "false" });
  }

  async function handleApprove(id: string) {
    setLoadingId(id);
    await updateGuestPhotoStatus(id, "approved");
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, status: "approved" } : p));
    setLoadingId(null);
  }

  async function handlePending(id: string) {
    setLoadingId(id);
    await updateGuestPhotoStatus(id, "pending");
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, status: "pending" } : p));
    setLoadingId(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta foto permanentemente?")) return;
    setLoadingId(id);
    await deleteGuestPhoto(id);
    setPhotos(prev => prev.filter(p => p.id !== id));
    setLoadingId(null);
  }

  const filtered = filter === "all" ? photos : photos.filter(p => p.status === filter);
  const pendingCount = photos.filter(p => p.status === "pending").length;

  return (
    <div className="max-w-5xl space-y-6">
      {/* QR para invitados */}
      <QRSection />

      {/* Config: aprobación manual */}
      <div className="bg-white rounded-lg border p-5 flex items-center justify-between gap-4">
        <div>
          <p className="font-medium text-wedding-dark text-sm">Aprobación manual de fotos</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {approval
              ? "Las fotos esperan tu aprobación antes de aparecer en el slideshow"
              : "Las fotos se publican automáticamente en el slideshow"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => toggleApproval(!approval)}
          className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${
            approval ? "bg-wedding-gold" : "bg-gray-200"
          }`}
          aria-label={approval ? "Desactivar aprobación manual" : "Activar aprobación manual"}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
              approval ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "pending", "approved"] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              filter === f
                ? "bg-wedding-dark text-white"
                : "bg-white border hover:bg-muted/50"
            }`}
          >
            {f === "all"
              ? `Todas (${photos.length})`
              : f === "pending"
              ? `Pendientes${pendingCount > 0 ? ` (${pendingCount})` : ""}`
              : `Aprobadas (${photos.filter(p => p.status === "approved").length})`}
          </button>
        ))}
      </div>

      {/* Grid de fotos */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center text-muted-foreground">
          <p className="text-3xl mb-2">📷</p>
          <p className="text-sm">
            {photos.length === 0
              ? "Todavía no hay fotos subidas por invitados"
              : "No hay fotos en este estado"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(photo => (
            <div
              key={photo.id}
              className={`bg-white rounded-lg border overflow-hidden transition-opacity ${
                loadingId === photo.id ? "opacity-50" : ""
              }`}
            >
              <div className="relative aspect-square bg-muted">
                <NextImage
                  src={photo.photo_url}
                  alt={photo.guest_name}
                  fill
                  className="object-cover"
                  sizes="220px"
                />
                {photo.status === "pending" && (
                  <span className="absolute top-1.5 left-1.5 bg-amber-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                    Pendiente
                  </span>
                )}
              </div>
              <div className="p-3 space-y-2">
                <div>
                  <p className="text-sm font-medium text-wedding-dark truncate leading-tight">
                    {photo.guest_name}
                  </p>
                  {photo.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {photo.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-1.5">
                  {photo.status === "pending" ? (
                    <button
                      onClick={() => handleApprove(photo.id)}
                      disabled={loadingId === photo.id}
                      className="flex-1 text-xs py-1.5 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors disabled:opacity-50"
                    >
                      Aprobar
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePending(photo.id)}
                      disabled={loadingId === photo.id}
                      className="flex-1 text-xs py-1.5 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors disabled:opacity-50"
                    >
                      Quitar
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(photo.id)}
                    disabled={loadingId === photo.id}
                    className="text-xs py-1.5 px-2 bg-red-50 text-red-500 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50"
                    title="Eliminar"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
