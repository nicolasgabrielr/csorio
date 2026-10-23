"use client";

import { useState } from "react";

export default function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback silencioso
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-4 py-2 border border-wedding-gold/40 rounded text-sm text-wedding-gold hover:bg-wedding-gold/10 transition-colors"
    >
      {copied ? "✓ Copiado!" : `Copiar ${label}`}
    </button>
  );
}
