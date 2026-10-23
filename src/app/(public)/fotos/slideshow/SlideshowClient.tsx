"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import type { GuestPhoto } from "@/actions/guest-photos";

const SLIDE_DURATION = 6000;

export default function SlideshowClient({
  initialPhotos,
  brideName,
  groomName,
}: {
  initialPhotos: GuestPhoto[];
  brideName?: string;
  groomName?: string;
}) {
  const [photos, setPhotos] = useState<GuestPhoto[]>(initialPhotos);
  const [currentIndex, setCurrentIndex] = useState(0);
  const photosRef = useRef<GuestPhoto[]>(initialPhotos);

  // Sync ref whenever photos change
  useEffect(() => {
    photosRef.current = photos;
    // Keep currentIndex in bounds after a deletion
    setCurrentIndex(i => Math.min(i, Math.max(0, photos.length - 1)));
  }, [photos]);

  // Polling cada 7 segundos: agrega fotos nuevas sin resetear el slideshow
  useEffect(() => {
    async function poll() {
      try {
        const res = await fetch("/api/fotos/approved", { cache: "no-store" });
        if (!res.ok) return;
        const fresh: GuestPhoto[] = await res.json();
        setPhotos(prev => {
          const freshIds = new Set(fresh.map(p => p.id));
          const surviving = prev.filter(p => freshIds.has(p.id));
          const existingIds = new Set(surviving.map(p => p.id));
          const added = fresh.filter(p => !existingIds.has(p.id));
          if (added.length === 0 && surviving.length === prev.length) return prev;
          return [...surviving, ...added];
        });
      } catch { /* ignorar errores de red */ }
    }

    const id = setInterval(poll, 7000);
    return () => clearInterval(id);
  }, []);

  // Supabase Realtime como bonus (requiere activarlo en el Dashboard de Supabase)
  useEffect(() => {
    const channel = supabase
      .channel("guest-photos-slideshow")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "guest_photos" },
        (payload) => {
          const photo = payload.new as GuestPhoto;
          if (photo.status === "approved") {
            setPhotos(prev => prev.find(p => p.id === photo.id) ? prev : [...prev, photo]);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "guest_photos" },
        (payload) => {
          const photo = payload.new as GuestPhoto;
          setPhotos(prev => {
            if (photo.status === "approved") {
              const exists = prev.find(p => p.id === photo.id);
              return exists ? prev.map(p => p.id === photo.id ? photo : p) : [...prev, photo];
            }
            return prev.filter(p => p.id !== photo.id);
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "guest_photos" },
        (payload) => {
          const deleted = payload.old as { id: string };
          setPhotos(prev => prev.filter(p => p.id !== deleted.id));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Auto-avance — crea el interval una vez y usa el ref para el length actual
  useEffect(() => {
    const id = setInterval(() => {
      setCurrentIndex(prev => {
        const len = photosRef.current.length;
        if (len <= 1) return 0;
        return (prev + 1) % len;
      });
    }, SLIDE_DURATION);
    return () => clearInterval(id);
  }, []);

  const coupleNames = brideName && groomName ? `${brideName} & ${groomName}` : "";
  const safeIndex = photos.length > 0 ? currentIndex % photos.length : 0;
  const currentPhoto = photos[safeIndex];

  if (photos.length === 0) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ background: "#1A1A1A" }}
      >
        {coupleNames && (
          <p className="font-display text-wedding-gold text-3xl mb-8">{coupleNames}</p>
        )}
        <p className="text-6xl mb-4">📸</p>
        <p className="text-white/40 text-xl">Esperando las primeras fotos...</p>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: "#0A0A0A" }}
    >
      {/* Fotos con crossfade */}
      <AnimatePresence mode="wait">
        {currentPhoto && (
          <motion.div
            key={currentPhoto.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentPhoto.photo_url}
              alt={currentPhoto.guest_name}
              className="w-full h-full object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gradiente inferior para legibilidad del texto */}
      <div
        className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
        style={{ height: "40%", background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)" }}
      />

      {/* Texto: nombre + descripción */}
      <AnimatePresence mode="wait">
        {currentPhoto && (
          <motion.div
            key={currentPhoto.id + "-text"}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="absolute bottom-10 left-10 right-10 z-20"
          >
            <p className="font-display text-white text-3xl sm:text-4xl drop-shadow-lg leading-tight">
              {currentPhoto.guest_name}
            </p>
            {currentPhoto.description && (
              <p className="text-white/80 text-xl sm:text-2xl mt-2 drop-shadow leading-snug">
                {currentPhoto.description}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Marca de agua: nombre de la pareja */}
      {coupleNames && (
        <div className="absolute top-6 right-8 z-20">
          <p className="font-display text-wedding-gold/70 text-xl drop-shadow">
            {coupleNames}
          </p>
        </div>
      )}

      {/* Contador: X / Y */}
      {photos.length > 1 && (
        <div className="absolute top-6 left-8 z-20">
          <p className="text-white/30 text-sm tabular-nums">
            {safeIndex + 1} / {photos.length}
          </p>
        </div>
      )}

      {/* Barra de progreso */}
      {photos.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 z-20">
          <motion.div
            key={currentPhoto?.id + "-progress"}
            className="h-full bg-wedding-gold/60"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
          />
        </div>
      )}
    </div>
  );
}
