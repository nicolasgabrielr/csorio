"use client";

import { useState, useEffect } from "react";

type Props = {
  bgPhoto: string;
  giftsBody: string;
  // ARS
  cbuArs: string;
  aliasArs: string;
  holderArs: string;
  // USD
  cbuUsd: string;
  aliasUsd: string;
  holderUsd: string;
};

function CopiarBtn({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  async function handle() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={handle}
      className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-muted bg-muted/50 text-xs font-medium uppercase tracking-widest text-wedding-dark hover:bg-muted transition-colors"
    >
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
        <rect x="7" y="7" width="10" height="12" rx="1.5" />
        <path d="M13 7V5a1.5 1.5 0 0 0-1.5-1.5h-7A1.5 1.5 0 0 0 3 5v10a1.5 1.5 0 0 0 1.5 1.5H7" />
      </svg>
      {copied ? `¡Copiado!` : `Copiar ${label}`}
    </button>
  );
}

function CuentaCard({
  title,
  holder,
  cbu,
  alias,
}: {
  title: string;
  holder: string;
  cbu: string;
  alias: string;
}) {
  return (
    <div className="space-y-5">
      <h3 className="font-display italic text-2xl text-wedding-gold">{title}</h3>
      <div className="space-y-4 text-sm">
        {holder && (
          <div>
            <p className="text-xs font-semibold text-wedding-gold uppercase tracking-wide mb-0.5">Titular:</p>
            <p className="text-wedding-dark">{holder}</p>
          </div>
        )}
        {alias && (
          <div>
            <p className="text-xs font-semibold text-wedding-gold uppercase tracking-wide mb-0.5">Alias:</p>
            <p className="text-wedding-dark font-mono">{alias}</p>
          </div>
        )}
        {cbu && (
          <div>
            <p className="text-xs font-semibold text-wedding-gold uppercase tracking-wide mb-0.5">CBU:</p>
            <p className="text-wedding-dark font-mono break-all">{cbu}</p>
          </div>
        )}
      </div>
      <div className="space-y-2 pt-1">
        {cbu && <CopiarBtn text={cbu} label="CBU" />}
        {alias && <CopiarBtn text={alias} label="Alias" />}
      </div>
    </div>
  );
}

export default function RegalosModal({
  bgPhoto, giftsBody,
  cbuArs, aliasArs, holderArs,
  cbuUsd, aliasUsd, holderUsd,
}: Props) {
  const [open, setOpen] = useState(false);
  const hasUsd = cbuUsd || aliasUsd;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open]);

  return (
    <>
      {/* Sección */}
      <section
        className="relative py-24 px-6 bg-cover bg-center"
        style={{ backgroundImage: `url('${bgPhoto}')` }}
      >
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />

        {/* Card central */}
        <div className="relative z-10 max-w-lg mx-auto bg-white rounded-2xl shadow-xl px-10 py-12 text-center">
          {/* Ícono regalo */}
          <div className="inline-block text-wedding-gold/70 mb-4">
            <svg viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 mx-auto">
              <rect x="8" y="22" width="40" height="28" rx="2" />
              <rect x="6" y="14" width="44" height="10" rx="2" />
              <line x1="28" y1="14" x2="28" y2="50" />
              {/* lazo izquierdo */}
              <path d="M28 14 C20 14 14 8 20 6 C24 4 28 14 28 14Z" />
              {/* lazo derecho */}
              <path d="M28 14 C36 14 42 8 36 6 C32 4 28 14 28 14Z" />
            </svg>
          </div>

          <h2 className="font-display italic text-3xl text-wedding-dark mb-4">Regalos</h2>

          <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-xs mx-auto">
            {giftsBody || "Tu presencia es lo más importante para nosotros. Si además querés hacernos un regalo te contamos cómo hacerlo."}
          </p>

          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 px-8 py-3 bg-wedding-gold text-white text-xs font-medium uppercase tracking-widest rounded-full hover:bg-wedding-gold/90 transition-colors"
          >
            Más información
          </button>
        </div>
      </section>

      {/* Modal */}
      {open && (
        <CuentaModal
          cbuArs={cbuArs} aliasArs={aliasArs} holderArs={holderArs}
          cbuUsd={cbuUsd} aliasUsd={aliasUsd} holderUsd={holderUsd}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

// Export reutilizable para abrir el modal de cuenta desde otros componentes
export function CuentaModal({
  cbuArs, aliasArs, holderArs, cbuUsd, aliasUsd, holderUsd, onClose,
}: {
  cbuArs: string; aliasArs: string; holderArs: string;
  cbuUsd: string; aliasUsd: string; holderUsd: string;
  onClose: () => void;
}) {
  const hasUsd = cbuUsd || aliasUsd;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-wedding-dark transition-colors text-xl font-light"
          aria-label="Cerrar"
        >
          ✕
        </button>
        <div className={`p-8 ${hasUsd ? "divide-y divide-muted space-y-6" : ""}`}>
          <CuentaCard title="Cuenta bancaria" holder={holderArs} cbu={cbuArs} alias={aliasArs} />
          {hasUsd && (
            <div className="pt-6">
              <CuentaCard title="Cuenta en Dólares" holder={holderUsd} cbu={cbuUsd} alias={aliasUsd} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
