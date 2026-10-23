"use client";

import { useState, useEffect } from "react";
import GuestSearch from "./GuestSearch";
import { CuentaModal } from "./RegalosModal";

type Props = {
  brideName: string;
  groomName: string;
  bgPhoto: string;
  rsvpText: string;
  rsvpDeadline: string;
  cbuArs: string;
  aliasArs: string;
  holderArs: string;
  cbuUsd: string;
  aliasUsd: string;
  holderUsd: string;
};

export default function ConfirmarModal({
  brideName, groomName, bgPhoto, rsvpText, rsvpDeadline,
  cbuArs, aliasArs, holderArs, cbuUsd, aliasUsd, holderUsd,
}: Props) {
  const [open, setOpen] = useState(false);
  const [openRegalos, setOpenRegalos] = useState(false);

  useEffect(() => {
    document.body.style.overflow = (open || openRegalos) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open, openRegalos]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpenRegalos(false); setOpen(false); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  function handleOpenRegalos() {
    setOpen(false);
    setOpenRegalos(true);
  }

  return (
    <>
      {/* Sección — banner dorado */}
      <section className="bg-wedding-gold py-20 px-6 text-center">
        <div className="inline-block text-white/80 mb-4">
          <svg viewBox="0 0 48 56" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" className="w-10 h-12 mx-auto">
            <rect x="6" y="10" width="36" height="40" rx="3" />
            <path d="M16 10V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3" />
            <line x1="14" y1="24" x2="34" y2="24" />
            <line x1="14" y1="32" x2="28" y2="32" />
            <path d="M30 36l4 4 6-6" strokeWidth={1.8} />
          </svg>
        </div>

        <p className="text-white/80 text-xs uppercase tracking-[0.25em] mb-2">RSVP</p>
        <h2 className="font-display italic text-3xl sm:text-4xl text-white mb-4">
          Confirmación de Asistencia
        </h2>
        <p className="text-white/80 text-sm mb-1">{rsvpText}</p>
        <p className="text-white/70 text-sm mb-8">
          Por favor confirmá antes del {rsvpDeadline}
        </p>

        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-wedding-gold font-medium tracking-widest uppercase text-xs rounded-full hover:bg-white/90 transition-all duration-300"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          Confirmar asistencia
        </button>
      </section>

      {/* Modal confirmar */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-md max-h-[90vh] bg-wedding-cream rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-wedding-gold/20 shrink-0">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-wedding-gold">RSVP</p>
                <h2 className="font-display text-xl text-wedding-dark">Confirmar asistencia</h2>
              </div>
              <button onClick={() => setOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-wedding-dark hover:bg-white transition-colors" aria-label="Cerrar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-6">
              <GuestSearch brideName={brideName} groomName={groomName} onOpenRegalos={handleOpenRegalos} />
            </div>
          </div>
        </div>
      )}

      {/* Modal regalos */}
      {openRegalos && (
        <CuentaModal
          cbuArs={cbuArs} aliasArs={aliasArs} holderArs={holderArs}
          cbuUsd={cbuUsd} aliasUsd={aliasUsd} holderUsd={holderUsd}
          onClose={() => setOpenRegalos(false)}
        />
      )}
    </>
  );
}
