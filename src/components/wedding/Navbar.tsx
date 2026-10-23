"use client";

import { useState } from "react";
import Link from "next/link";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/lugar", label: "Lugar" },
];

export default function Navbar({ brideName, groomName }: { brideName?: string; groomName?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="relative z-50 absolute top-0 left-0 right-0">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        {/* Logo / names */}
        <Link href="/" className="font-display text-white/90 text-xl tracking-wide">
          {brideName || "Novia"} &amp;{" "}
          {groomName || "Novio"}
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-white/80 hover:text-white transition-colors tracking-wide"
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setOpen(!open)}
          aria-label="Menú"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-wedding-dark/95 backdrop-blur px-6 py-4 space-y-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block text-white/80 hover:text-white py-2 border-b border-white/10 last:border-0"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
