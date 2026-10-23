"use client";

import { useState } from "react";
import { updatePrices, updateFixedCosts } from "@/actions/prices";
import type { Prices } from "@/lib/mock-db";
import type { FixedCosts } from "@/actions/prices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function PriceRow({
  label,
  sublabel,
  value,
  onChange,
  perPerson = true,
}: {
  label: string;
  sublabel: string;
  value: string;
  onChange: (v: string) => void;
  perPerson?: boolean;
}) {
  const num = parseFloat(value) || 0;
  return (
    <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
      <div className="flex-1">
        <p className="text-sm font-medium text-wedding-dark">{label}</p>
        <p className="text-xs text-muted-foreground">{sublabel}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">$</span>
        <Input
          type="number"
          min="0"
          step="1000"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="0"
          className="w-36 text-right"
        />
      </div>
      {num === 0 && perPerson && (
        <span className="text-xs text-wedding-gold whitespace-nowrap">Los novios invitan 😉</span>
      )}
      {num > 0 && (
        <span className="text-xs text-muted-foreground whitespace-nowrap w-28 text-right">
          ${num.toLocaleString("es-AR")}{perPerson ? " c/u" : ""}
        </span>
      )}
      {num === 0 && !perPerson && (
        <span className="text-xs text-muted-foreground whitespace-nowrap w-28 text-right">—</span>
      )}
    </div>
  );
}

function SaveButton({ saving, saved, label = "Guardar", onClick }: { saving: boolean; saved: boolean; label?: string; onClick: () => void }) {
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={saving}
      className={`w-full ${saved ? "bg-green-600 hover:bg-green-600" : "bg-wedding-gold hover:bg-wedding-gold/90"} text-white transition-colors`}
    >
      {saving ? "Guardando..." : saved ? "✓ Guardado" : label}
    </Button>
  );
}

export default function PreciosForm({
  initialPrices,
  initialFixedCosts,
}: {
  initialPrices: Prices;
  initialFixedCosts: FixedCosts;
}) {
  // — Precios por persona —
  const [prices, setPrices] = useState({
    adult_cost:   initialPrices.adult_cost.toString(),
    over12_cost:  initialPrices.over12_cost.toString(),
    under12_cost: initialPrices.under12_cost.toString(),
  });
  const [savingPrices, setSavingPrices] = useState(false);
  const [savedPrices, setSavedPrices] = useState(false);

  async function handleSavePrices() {
    setSavingPrices(true);
    await updatePrices({
      adult_cost:   parseFloat(prices.adult_cost)   || 0,
      over12_cost:  parseFloat(prices.over12_cost)  || 0,
      under12_cost: parseFloat(prices.under12_cost) || 0,
    });
    setSavingPrices(false);
    setSavedPrices(true);
    setTimeout(() => setSavedPrices(false), 2500);
  }

  // — Costos fijos —
  const [fixed, setFixed] = useState({
    salon:      initialFixedCosts.salon.toString(),
    deco:       initialFixedCosts.deco.toString(),
    dj:         initialFixedCosts.dj.toString(),
    cotillon:   initialFixedCosts.cotillon.toString(),
    catering:   initialFixedCosts.catering.toString(),
    foto_video: initialFixedCosts.foto_video.toString(),
    traje:      initialFixedCosts.traje.toString(),
    vestido:    initialFixedCosts.vestido.toString(),
  });
  const [savingFixed, setSavingFixed] = useState(false);
  const [savedFixed, setSavedFixed] = useState(false);

  const fixedTotal =
    (parseFloat(fixed.salon)      || 0) +
    (parseFloat(fixed.deco)       || 0) +
    (parseFloat(fixed.dj)         || 0) +
    (parseFloat(fixed.cotillon)   || 0) +
    (parseFloat(fixed.catering)   || 0) +
    (parseFloat(fixed.foto_video) || 0) +
    (parseFloat(fixed.traje)      || 0) +
    (parseFloat(fixed.vestido)    || 0);

  async function handleSaveFixed() {
    setSavingFixed(true);
    await updateFixedCosts({
      salon:      parseFloat(fixed.salon)      || 0,
      deco:       parseFloat(fixed.deco)       || 0,
      dj:         parseFloat(fixed.dj)         || 0,
      cotillon:   parseFloat(fixed.cotillon)   || 0,
      catering:   parseFloat(fixed.catering)   || 0,
      foto_video: parseFloat(fixed.foto_video) || 0,
      traje:      parseFloat(fixed.traje)      || 0,
      vestido:    parseFloat(fixed.vestido)    || 0,
    });
    setSavingFixed(false);
    setSavedFixed(true);
    setTimeout(() => setSavedFixed(false), 2500);
  }

  return (
    <div className="max-w-lg space-y-6">
      {/* Precios por acompañante */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div>
          <h2 className="font-display text-lg text-wedding-dark">Por acompañante</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Se aplican al cargar nuevos invitados.
          </p>
        </div>
        <PriceRow
          label="Adultos"
          sublabel="Por cada acompañante adulto"
          value={prices.adult_cost}
          onChange={v => setPrices(f => ({ ...f, adult_cost: v }))}
        />
        <PriceRow
          label="Mayores de 12"
          sublabel="Por cada acompañante mayor de 12 años"
          value={prices.over12_cost}
          onChange={v => setPrices(f => ({ ...f, over12_cost: v }))}
        />
        <PriceRow
          label="Menores de 12"
          sublabel="Por cada acompañante menor de 12 años"
          value={prices.under12_cost}
          onChange={v => setPrices(f => ({ ...f, under12_cost: v }))}
        />
        <SaveButton saving={savingPrices} saved={savedPrices} label="Guardar precios" onClick={handleSavePrices} />
      </div>

      {/* Costos fijos del evento */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div>
          <h2 className="font-display text-lg text-wedding-dark">Costos del evento</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Costos fijos para el balance en métricas.
          </p>
        </div>
        <PriceRow
          label="Salón"
          sublabel="Alquiler del salón"
          value={fixed.salon}
          onChange={v => setFixed(f => ({ ...f, salon: v }))}
          perPerson={false}
        />
        <PriceRow
          label="Decoración"
          sublabel="Decoración del evento"
          value={fixed.deco}
          onChange={v => setFixed(f => ({ ...f, deco: v }))}
          perPerson={false}
        />
        <PriceRow
          label="DJ"
          sublabel="Música y sonido"
          value={fixed.dj}
          onChange={v => setFixed(f => ({ ...f, dj: v }))}
          perPerson={false}
        />
        <PriceRow
          label="Cotillón"
          sublabel="Decoración y cotillón"
          value={fixed.cotillon}
          onChange={v => setFixed(f => ({ ...f, cotillon: v }))}
          perPerson={false}
        />
        <PriceRow
          label="Catering"
          sublabel="Comida y bebida"
          value={fixed.catering}
          onChange={v => setFixed(f => ({ ...f, catering: v }))}
          perPerson={false}
        />
        <PriceRow
          label="Fotografía y Video"
          sublabel="Servicio de fotografía y video"
          value={fixed.foto_video}
          onChange={v => setFixed(f => ({ ...f, foto_video: v }))}
          perPerson={false}
        />
        <PriceRow
          label="Traje Novio"
          sublabel="Traje del novio"
          value={fixed.traje}
          onChange={v => setFixed(f => ({ ...f, traje: v }))}
          perPerson={false}
        />
        <PriceRow
          label="Vestido Novia"
          sublabel="Vestido de la novia"
          value={fixed.vestido}
          onChange={v => setFixed(f => ({ ...f, vestido: v }))}
          perPerson={false}
        />
        {fixedTotal > 0 && (
          <div className="flex items-center justify-between px-4 py-2 bg-wedding-dark/5 rounded-lg">
            <span className="text-sm font-medium text-wedding-dark">Total costos fijos</span>
            <span className="text-sm font-bold text-wedding-dark">
              ${fixedTotal.toLocaleString("es-AR")}
            </span>
          </div>
        )}
        <SaveButton saving={savingFixed} saved={savedFixed} label="Guardar costos" onClick={handleSaveFixed} />
      </div>
    </div>
  );
}
