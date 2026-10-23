"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type Photo = { src: string; alt: string };

type ActivePhoto = {
  id: number;
  photo: Photo;
  x: number;   // % from left
  y: number;   // % from top
  rotate: number;
  size: number; // px width
};

// Solo costados izquierdo y derecho
const ZONES = [
  { xMin: 1,  xMax: 18, yMin: 5,  yMax: 42 },
  { xMin: 1,  xMax: 18, yMin: 48, yMax: 88 },
  { xMin: 78, xMax: 95, yMin: 5,  yMax: 42 },
  { xMin: 78, xMax: 95, yMin: 48, yMax: 88 },
];

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function makePhoto(id: number, photos: Photo[]): ActivePhoto {
  const zone = ZONES[Math.floor(Math.random() * ZONES.length)];
  return {
    id,
    photo: photos[id % photos.length],
    x: rand(zone.xMin, zone.xMax),
    y: rand(zone.yMin, zone.yMax),
    rotate: rand(-18, 18),
    size: Math.round(rand(110, 170)),
  };
}

export default function FloatingPhotos({ photos }: { photos: Photo[] }) {
  const [active, setActive] = useState<ActivePhoto[]>([]);
  const counter = useRef(0);

  useEffect(() => {
    if (photos.length === 0) return;

    // Arrancar con 3 fotos ya visibles
    const initial = Array.from({ length: Math.min(3, photos.length) }, (_, i) => {
      counter.current = i;
      return makePhoto(i, photos);
    });
    counter.current = initial.length;
    setActive(initial);

    const interval = setInterval(() => {
      const id = counter.current++;
      const next = makePhoto(id, photos);
      setActive(prev => {
        const updated = [...prev, next];
        return updated.length > 5 ? updated.slice(1) : updated;
      });
    }, 2200);

    return () => clearInterval(interval);
  }, [photos]);

  if (photos.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <AnimatePresence>
        {active.map(item => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 0.75, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            style={{
              position: "absolute",
              left: `${item.x}%`,
              top: `${item.y}%`,
              width: item.size,
              height: item.size * 1.3,
              transform: `rotate(${item.rotate}deg)`,
            }}
            className="rounded-lg overflow-hidden shadow-2xl ring-2 ring-white/20"
          >
            <Image
              src={item.photo.src}
              alt={item.photo.alt}
              fill
              className="object-cover"
              sizes="180px"
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
