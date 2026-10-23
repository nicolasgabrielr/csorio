"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/wedding/Navbar";
import FloatingPhotos from "@/components/wedding/FloatingPhotos";

function Slideshow({ photos }: { photos: { src: string; alt: string }[] }) {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);

  const next = useCallback(() => {
    setCurrent(c => {
      setPrev(c);
      return (c + 1) % photos.length;
    });
  }, [photos.length]);

  // Auto-avance cada 4 segundos
  useEffect(() => {
    if (photos.length <= 1) return;
    const id = setInterval(next, 4000);
    return () => clearInterval(id);
  }, [next, photos.length]);

  // Limpiar "prev" después de que termine la transición
  useEffect(() => {
    if (prev === null) return;
    const id = setTimeout(() => setPrev(null), 500);
    return () => clearTimeout(id);
  }, [prev]);

  function goTo(i: number) {
    setPrev(current);
    setCurrent(i);
  }

  return (
    <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] overflow-hidden rounded-2xl shadow-xl bg-wedding-dark">
      {photos.map((photo, i) => {
        const isActive = i === current;
        const isPrev = i === prev;
        return (
          <div
            key={photo.src}
            className="absolute inset-0 transition-opacity duration-[500ms] ease-in-out"
            style={{ opacity: isActive ? 1 : isPrev ? 0 : 0, zIndex: isActive ? 2 : isPrev ? 1 : 0 }}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              className="object-cover"
              priority={i === 0}
              sizes="(max-width: 768px) 100vw, 90vw"
            />
          </div>
        );
      })}

      {/* Dots */}
      {photos.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Ir a foto ${i + 1}`}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === current
                  ? "bg-white scale-125"
                  : "bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}

      {/* Flechas */}
      {photos.length > 1 && (
        <>
          <button
            onClick={() => goTo((current - 1 + photos.length) % photos.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors"
            aria-label="Anterior"
          >
            ‹
          </button>
          <button
            onClick={() => goTo((current + 1) % photos.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors"
            aria-label="Siguiente"
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}

function HeroCenterPhoto({ photos }: { photos: { src: string; alt: string }[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (photos.length <= 1) return;
    const id = setInterval(() => setIndex(i => (i + 1) % photos.length), 4000);
    return () => clearInterval(id);
  }, [photos.length]);

  if (photos.length === 0) return null;

  return (
    <div className="relative w-56 sm:w-72 aspect-[3/4] rounded-xl overflow-hidden shadow-2xl ring-2 ring-white/20">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={photos[index].src}
            alt={photos[index].alt}
            fill
            className="object-cover"
            sizes="300px"
            priority
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function GaleriaClient({
  photos,
  brideName,
  groomName,
}: {
  photos: { src: string; alt: string }[];
  brideName?: string;
  groomName?: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <>
      <section
        className="relative min-h-[75vh] flex flex-col overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1A1A1A 0%, #2C2518 100%)" }}
      >
        <FloatingPhotos photos={photos} />
        <Navbar brideName={brideName} groomName={groomName} />
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-6 py-12">
          <div className="text-center">
            <p className="text-wedding-gold text-sm uppercase tracking-[0.3em] mb-2">Nuestra historia</p>
            <h1 className="font-display text-4xl sm:text-5xl text-white">Galería</h1>
          </div>
          <HeroCenterPhoto photos={photos} />
        </div>
      </section>

      <section className="bg-wedding-cream py-16 px-6 min-h-[50vh]">
        <div className="max-w-5xl mx-auto space-y-10">
          {photos.length > 0 ? (
            <>
              {/* Slideshow */}
              <Slideshow photos={photos} />

              {/* Grid miniaturas */}
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {photos.map((photo, i) => (
                  <button
                    key={i}
                    onClick={() => setSelected(photo.src)}
                    className="aspect-square overflow-hidden rounded-md group"
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      width={150}
                      height={150}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 hover:opacity-100"
                    />
                  </button>
                ))}
              </div>

              {/* Lightbox */}
              {selected && (
                <div
                  className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                  onClick={() => setSelected(null)}
                >
                  <button
                    className="absolute top-4 right-4 text-white/60 hover:text-white text-4xl leading-none"
                    onClick={() => setSelected(null)}
                    aria-label="Cerrar"
                  >
                    ×
                  </button>
                  <Image
                    src={selected}
                    alt="Foto ampliada"
                    width={1200}
                    height={800}
                    className="max-w-full max-h-[90vh] object-contain rounded-lg"
                    onClick={e => e.stopPropagation()}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-muted-foreground py-20">
              <p className="text-4xl mb-3">📷</p>
              <p className="text-sm">
                Agregá fotos en <code className="text-xs bg-muted px-1 py-0.5 rounded">/public/photos/</code>
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
