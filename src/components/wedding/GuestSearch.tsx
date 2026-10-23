"use client";

import { useState } from "react";
import { searchGuest, getGuestForConfirmation } from "@/actions/guests";
import type { CompanionSuggestion } from "@/actions/guests";
import { confirmAttendance } from "@/actions/confirmations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Guest, CompanionType } from "@/lib/supabase";

// ✏️ Editá estas frases a gusto
const FRASES: Record<"family" | "friends", string[]> = {
  family: [
    "Prepárense para llorar un poquito… nosotros ya estamos sensibles.",
    "Gracias por acompañarnos siempre. Este es un capítulo más, y lo queremos vivir con ustedes.",
    "Sus abrazos ese día van a ser de los que no se olvidan.",
    "Prometemos brindis largos, fotos repetidas y mucho amor.",
    "Si hay alguien que tenía que estar, son ustedes.",
    "Gracias por acompañarnos en cada etapa… esta no podía ser sin ustedes.",
    "Su presencia es parte de nuestra historia.",
    "Nos vieron crecer, ahora vengan a ver cómo la seguimos.",
    "Esos abrazos ese día van a valer oro.",
    "Qué lindo compartir esto en familia con ustedes.",
    "Prometemos emoción, brindis y fotos que después vamos a comentar durante años.",
    "Su lugar ese día ya estaba reservado en nuestro corazón.",
    "Gracias por ser sostén, cariño y casa.",
    "Va a ser un día inolvidable, y queremos vivirlo con ustedes.",
    "Este paso lo damos rodeados de quienes nos enseñaron lo que es el amor.",
  ],
  friends: [
    "Confirmaste. Ahora no hay excusas: te queremos en la pista hasta que prendan las luces.",
    "Gracias por venir a comprobar si lloramos en el civil.",
    "Traé ganas de bailar, de brindar y de quedarte hasta el final.",
    "Sabíamos que no ibas a arrugar. Te tenemos fe.",
    "Ojo que vamos a pasar lista en la pista.",
    "Gracias por sumarte a esta fiesta que venimos planeando hace mil.",
    "Te esperamos para el abrazo, la foto y el 'che, qué rápido pasó todo'.",
    "Ese día brindamos sí o sí juntos.",
    "Ahora que confirmaste… no aceptamos cancelaciones, eh.",
    "Sumamos una persona más a la mesa que va a romperla toda.",
    "Te queremos hidratado… pero no tanto.",
    "Tu misión: romper la pista y salir digno en las fotos.",
    "Venís a festejar… y a vigilar que no lloremos demasiado.",
    "Ese día nadie se va antes que nosotros. Avisado.",
    "Hay barra libre… pero la resaca corre por tu cuenta.",
    "Sabemos que vas a darlo todo. Confiamos en vos.",
    "Si no bailás, devolvés el regalo.",
    "Venís como invitado, pero te necesitamos como animador oficial.",
    "Traé pañuelos… y zapatillas cómodas.",
    "Ese día se brinda fuerte y se abraza más fuerte todavía.",
    "Confirmaste. Ahora sos parte del operativo fiesta.",
    "La consigna es simple: pasarla increíble.",
    "Te queremos ahí, riéndote fuerte y cantando peor que nunca.",
  ],
};

/** "Patricia Florencia Berkovics" → "Patricia F. B." */
function maskName(fullName: string): string {
  const words = fullName.trim().split(/\s+/);
  if (words.length <= 1) return fullName;
  const [first, ...rest] = words;
  return `${first} ${rest.map(w => w[0].toUpperCase() + ".").join(" ")}`;
}

const normStr = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

function CompanionSuggestionCard({
  suggestion,
  searchedName,
  onConfirm,
  variant = "default",
}: {
  suggestion: CompanionSuggestion;
  searchedName: string;
  onConfirm: (guestId: string) => void;
  variant?: "default" | "muted";
}) {
  const verified = normStr(searchedName) === normStr(suggestion.companionName);
  const bg = variant === "muted" ? "bg-amber-50/60" : "bg-amber-50";

  return (
    <div className={`p-4 ${bg} border border-amber-200 rounded-xl space-y-3`}>
      <div className="space-y-1">
        <p className="font-medium text-amber-900">¿Sos {maskName(suggestion.companionName)}?</p>
        <p className="text-sm text-amber-800">
          Estás en la lista de <span className="font-semibold">{maskName(suggestion.guestName)}</span>.
        </p>
      </div>
      {verified ? (
        <Button
          type="button"
          size="sm"
          onClick={() => onConfirm(suggestion.guestId)}
          className="w-full bg-wedding-gold hover:bg-wedding-gold/90 text-white text-xs"
        >
          Confirmar por esta lista →
        </Button>
      ) : (
        <p className="text-xs text-amber-700">Escribí tu nombre completo para confirmar.</p>
      )}
    </div>
  );
}

function getFrase(guest: Guest): string {
  if (guest.phrase_type === "custom" && guest.custom_phrase?.trim()) {
    return guest.custom_phrase.trim();
  }
  const pool = FRASES[guest.phrase_type === "family" ? "family" : "friends"];
  return pool[Math.floor(Math.random() * pool.length)];
}

type SearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "not_found" }
  | { status: "name_hint"; candidates: Guest[]; suggestions?: CompanionSuggestion[] }
  | { status: "companion_suggestion"; suggestions: CompanionSuggestion[] }
  | { status: "already_confirmed" }
  | { status: "found"; guest: Guest }
  | { status: "success"; frase: string };

const MENU_OPTIONS = ["Ninguno", "Celiaco", "Vegetariano", "Vegano"] as const;

function MenuToggle({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const hasSpecial = value !== "Ninguno";

  if (!open) {
    return hasSpecial ? (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border bg-wedding-gold/10 border-wedding-gold/40 text-wedding-gold hover:bg-wedding-gold/20 transition-colors"
      >
        {value}
        <span className="opacity-60">·</span>
        <span className="opacity-60">cambiar</span>
      </button>
    ) : (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-muted-foreground hover:text-wedding-gold transition-colors hover:underline underline-offset-2"
      >
        ¿Requiere menú especial?
      </button>
    );
  }

  return (
    <div className="flex gap-1 flex-wrap">
      {MENU_OPTIONS.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => { onChange(opt); setOpen(false); }}
          className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
            value === opt
              ? "bg-wedding-gold text-white border-wedding-gold"
              : "bg-white text-muted-foreground border-muted hover:border-wedding-gold/50"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

const TYPE_BADGE: Record<CompanionType, { label: string; className: string }> = {
  adult:   { label: "Adulto",       className: "text-wedding-gold bg-wedding-gold/10 border-wedding-gold/30" },
  over12:  { label: "Mayor de 12",  className: "text-orange-600 bg-orange-50 border-orange-200" },
  under12: { label: "Menor de 12",  className: "text-blue-600 bg-blue-50 border-blue-200" },
  under5:  { label: "Menor de 5",   className: "text-purple-600 bg-purple-50 border-purple-200" },
};

function CounterInput({ label, sublabel, value, max, onChange }: {
  label: string; sublabel: string; value: number; max: number; onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-3 bg-white rounded-lg border border-wedding-gold/20">
      <div>
        <p className="text-sm font-medium text-wedding-dark">{label}</p>
        {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))} disabled={value === 0}
          className="w-8 h-8 rounded-full border-2 border-wedding-gold text-wedding-gold font-bold hover:bg-wedding-gold hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed">−</button>
        <span className="font-display text-2xl text-wedding-dark w-6 text-center">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}
          className="w-8 h-8 rounded-full border-2 border-wedding-gold text-wedding-gold font-bold hover:bg-wedding-gold hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed">+</button>
      </div>
    </div>
  );
}

export default function GuestSearch({ brideName = "los novios", groomName = "", onOpenRegalos }: { brideName?: string; groomName?: string; onOpenRegalos?: () => void }) {
  const [name, setName] = useState("");
  const [state, setState] = useState<SearchState>({ status: "idle" });
  const [dni, setDni] = useState("");

  // Lista cerrada: un bool por cada locked companion (true = asiste)
  const [lockedChecked, setLockedChecked] = useState<boolean[]>([]);

  // Acompañantes adicionales libres
  const [openAdults, setOpenAdults] = useState(0);
  const [openOver12, setOpenOver12] = useState(0);
  const [openUnder12, setOpenUnder12] = useState(0);
  // Nombres de los acompañantes adicionales (orden: adults, over12, under12)
  const [openNames, setOpenNames] = useState<string[]>([]);

  // Menús: titular + locked + open
  const [mainMenu, setMainMenu] = useState("Ninguno");
  const [lockedMenus, setLockedMenus] = useState<string[]>([]);
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  function syncOpenNames(adults: number, over12: number, under12: number) {
    const total = adults + over12 + under12;
    setOpenNames(prev => {
      const next = [...prev];
      while (next.length < total) next.push("");
      return next.slice(0, total);
    });
    setOpenMenus(prev => {
      const next = [...prev];
      while (next.length < total) next.push("Ninguno");
      return next.slice(0, total);
    });
  }

  async function handleConfirmAsSuggestion(guestId: string) {
    setState({ status: "loading" });
    const result = await getGuestForConfirmation(guestId);
    if (!result.guest) { setState({ status: "not_found" }); return; }
    if (result.alreadyConfirmed) { setState({ status: "already_confirmed" }); return; }
    setState({ status: "found", guest: result.guest });
    setDni("");
    setLockedChecked((result.guest.locked_companions ?? []).map(() => true));
    setLockedMenus((result.guest.locked_companions ?? []).map(() => "Ninguno"));
    setMainMenu("Ninguno");
    setOpenAdults(0); setOpenOver12(0); setOpenUnder12(0);
    setOpenNames([]); setOpenMenus([]); setConfirmError("");
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setState({ status: "loading" });
    const result = await searchGuest(name);
    if (!result.guest) {
      // Hay candidatos (múltiples matches sin apellido confirmado)
      if (result.candidates && result.candidates.length > 0) {
        if (result.suggestionsEnabled) {
          setState({ status: "name_hint", candidates: result.candidates, suggestions: result.suggestions });
        } else {
          setState({ status: "not_found" });
        }
        return;
      }
      if (result.suggestions && result.suggestions.length > 0) {
        setState({ status: "companion_suggestion", suggestions: result.suggestions });
      } else {
        setState({ status: "not_found" });
      }
      return;
    }
    if (result.alreadyConfirmed) { setState({ status: "already_confirmed" }); return; }
    setState({ status: "found", guest: result.guest });
    setDni("");
    setLockedChecked((result.guest.locked_companions ?? []).map(() => true));
    setLockedMenus((result.guest.locked_companions ?? []).map(() => "Ninguno"));
    setMainMenu("Ninguno");
    setOpenAdults(0);
    setOpenOver12(0);
    setOpenUnder12(0);
    setOpenNames([]);
    setOpenMenus([]);
    setConfirmError("");
  }

  async function handleConfirm() {
    if (state.status !== "found") return;
    const g = state.guest;

    if (!dni.trim()) { setConfirmError("Por favor ingresá tu DNI"); return; }

    // Validar nombres de acompañantes adicionales
    const totalOpen = openAdults + openOver12 + openUnder12;
    for (let i = 0; i < totalOpen; i++) {
      if (!openNames[i]?.trim()) {
        let label = "";
        if (i < openAdults) label = `Adulto ${i + 1}`;
        else if (i < openAdults + openOver12) label = `Mayor de 12 — ${i - openAdults + 1}`;
        else label = `Menor de 12 — ${i - openAdults - openOver12 + 1}`;
        setConfirmError(`Ingresá el nombre de: ${label}`);
        return;
      }
    }

    // Construir lista final de acompañantes
    const lockedAttending = (g.locked_companions ?? [])
      .map((lc, i) => ({ lc, i }))
      .filter(({ i }) => lockedChecked[i])
      .map(({ lc, i }) => ({
        name: lc.name,
        type: lc.type,
        menu: lc.type === "under5" ? "Ninguno" : (lockedMenus[i] ?? "Ninguno"),
      }));

    const openCompanions = [
      ...Array.from({ length: openAdults },   (_, i) => ({ name: openNames[i].trim(),                        type: "adult"   as const, menu: openMenus[i] ?? "Ninguno" })),
      ...Array.from({ length: openOver12 },   (_, i) => ({ name: openNames[openAdults + i].trim(),           type: "over12"  as const, menu: openMenus[openAdults + i] ?? "Ninguno" })),
      ...Array.from({ length: openUnder12 },  (_, i) => ({ name: openNames[openAdults + openOver12 + i].trim(), type: "under12" as const, menu: openMenus[openAdults + openOver12 + i] ?? "Ninguno" })),
    ];

    const allCompanions = [...lockedAttending, ...openCompanions];
    const adult_count   = allCompanions.filter(c => c.type === "adult").length;
    const over12_count  = allCompanions.filter(c => c.type === "over12").length;
    const under12_count = allCompanions.filter(c => c.type === "under12").length;
    const under5_count  = allCompanions.filter(c => c.type === "under5").length;

    // Costo: titular (si paga) + locked companions usan su costo individual + open companions usan el costo por tipo
    const mainCost = g.main_cost ?? 0;
    const lockedCost = (g.locked_companions ?? [])
      .filter((_, i) => lockedChecked[i])
      .reduce((sum, lc) => sum + (lc.type === "under5" ? 0 : (lc.cost ?? 0)), 0);
    const openCost =
      openAdults   * (g.adult_cost   ?? 0) +
      openOver12   * (g.over12_cost  ?? 0) +
      openUnder12  * (g.under12_cost ?? 0);
    const totalCost = mainCost + lockedCost + openCost;

    setConfirming(true);
    setConfirmError("");

    const result = await confirmAttendance({
      guest_id: g.id,
      dni: dni.trim(),
      adult_count,
      over12_count,
      under12_count,
      under5_count,
      companions: allCompanions,
      main_menu: mainMenu,
      total_cost: totalCost,
    });

    setConfirming(false);
    if (!result.success) { setConfirmError(result.error ?? "Error al confirmar"); return; }
    setState({ status: "success", frase: getFrase(g) });
  }

  function handleReset() {
    setState({ status: "idle" });
    setName("");
    setDni("");
    setLockedChecked([]);
    setMainMenu("Ninguno");
    setLockedMenus([]);
    setOpenAdults(0);
    setOpenOver12(0);
    setOpenUnder12(0);
    setOpenNames([]);
    setOpenMenus([]);
    setConfirmError("");
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">

      {/* Buscador */}
      {(state.status === "idle" || state.status === "loading" || state.status === "not_found" || state.status === "companion_suggestion" || state.status === "name_hint") && (
        <form onSubmit={handleSearch} className="space-y-3">
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Escribí tu nombre y apellido"
            className="text-center text-base h-12 bg-white"
            disabled={state.status === "loading"}
          />
          <Button type="submit" className="w-full h-12 bg-wedding-gold hover:bg-wedding-gold/90 text-white text-base"
            disabled={state.status === "loading" || !name.trim()}>
            {state.status === "loading" ? "Buscando..." : "Buscar"}
          </Button>
        </form>
      )}

      {/* Pista de apellido: encontramos el invitado pero no ingresó el apellido */}
      {state.status === "name_hint" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground text-center">
            {state.candidates.length === 1
              ? "¿Sos esta persona?"
              : "Encontramos varias coincidencias. ¿Sos alguno de estos?"}
          </p>
          {state.candidates.map((c, i) => (
            <div key={i} className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              <p className="font-medium text-amber-900">{maskName(c.full_name)}</p>
              <p className="text-sm text-amber-800">Escribí tu nombre y apellido completo para confirmar.</p>
            </div>
          ))}
          {state.suggestions && state.suggestions.length > 0 && (
            <>
              <p className="text-xs text-center text-muted-foreground">O quizás estás en otra lista:</p>
              {state.suggestions.map((s, i) => (
                <CompanionSuggestionCard key={i} suggestion={s} searchedName={name} onConfirm={handleConfirmAsSuggestion} variant="muted" />
              ))}
            </>
          )}
        </div>
      )}

      {/* Sugerencia de acompañante */}
      {state.status === "companion_suggestion" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground text-center">
            No encontramos tu nombre en la lista principal, pero...
          </p>
          {state.suggestions.map((s, i) => (
            <CompanionSuggestionCard key={i} suggestion={s} searchedName={name} onConfirm={handleConfirmAsSuggestion} />
          ))}
          <p className="text-xs text-center text-muted-foreground pt-1">
            ¿No es ninguno? Contactá a cualquiera de los novios o probá con otro nombre.
          </p>
        </div>
      )}

      {/* No encontrado */}
      {state.status === "not_found" && (
        <div className="text-center space-y-4">
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-orange-700 font-medium">No encontramos tu nombre</p>
            <p className="text-sm text-orange-600 mt-1">Si creés que hay un error, contactá a cualquiera de los novios.</p>
          </div>
        </div>
      )}

      {/* Ya confirmó */}
      {state.status === "already_confirmed" && (() => {
        const weddingDate = process.env.NEXT_PUBLIC_WEDDING_DATE;
        const venueName = process.env.NEXT_PUBLIC_VENUE_NAME;
        const venueAddress = process.env.NEXT_PUBLIC_VENUE_ADDRESS;
        const venueMapsUrl = process.env.NEXT_PUBLIC_VENUE_MAPS_URL;
        const dateFormatted = weddingDate
          ? new Date(weddingDate + "T12:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
          : "el gran día";
        return (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <p className="text-blue-700 font-medium">¡Ya confirmaste tu asistencia!</p>
              <p className="text-sm text-blue-600 mt-1 capitalize">Nos vemos el <span className="font-medium">{dateFormatted}</span> 🎉</p>
            </div>
            <div className="space-y-3">
              {(venueName || venueAddress) && (
                <a href={venueMapsUrl ?? "#"} target="_blank" rel="noopener noreferrer"
                  className="flex gap-3 p-3 bg-white rounded-lg border border-wedding-gold/20 hover:border-wedding-gold/50 transition-colors group">
                  <span className="text-lg shrink-0">📍</span>
                  <div>
                    {venueName && <p className="text-sm font-medium text-wedding-dark group-hover:text-wedding-gold transition-colors">{venueName}</p>}
                    {venueAddress && <p className="text-xs text-muted-foreground">{venueAddress}</p>}
                    <p className="text-xs text-wedding-gold mt-0.5">Ver en Google Maps →</p>
                  </div>
                </a>
              )}
              {onOpenRegalos ? (
                <button onClick={onOpenRegalos} className="w-full flex gap-3 p-3 bg-white rounded-lg border border-wedding-gold/20 hover:border-wedding-gold/50 transition-colors group text-left">
                  <span className="text-lg shrink-0">🎁</span>
                  <div>
                    <p className="text-sm font-medium text-wedding-dark group-hover:text-wedding-gold transition-colors">Ayudanos a cumplir nuestro sueño</p>
                    <p className="text-xs text-muted-foreground">Ver info de regalos →</p>
                  </div>
                </button>
              ) : (
                <a href="/regalos" className="flex gap-3 p-3 bg-white rounded-lg border border-wedding-gold/20 hover:border-wedding-gold/50 transition-colors group">
                  <span className="text-lg shrink-0">🎁</span>
                  <div>
                    <p className="text-sm font-medium text-wedding-dark group-hover:text-wedding-gold transition-colors">Ayudanos a cumplir nuestro sueño</p>
                    <p className="text-xs text-muted-foreground">Ir a la sección regalos →</p>
                  </div>
                </a>
              )}
            </div>
            <Button variant="outline" onClick={handleReset} className="w-full">Volver</Button>
          </div>
        );
      })()}

      {/* Invitado encontrado */}
      {state.status === "found" && (() => {
        const g = state.guest;
        const locked = g.locked_companions ?? [];
        const hasOpenAdults  = g.max_adults  > 0;
        const hasOpenOver12  = g.max_over12  > 0;
        const hasOpenUnder12 = g.max_under12 > 0;
        const hasAnyOpen = hasOpenAdults || hasOpenOver12 || hasOpenUnder12;
        const totalOpen = openAdults + openOver12 + openUnder12;

        const lockedCostDisplay = locked.reduce((sum, lc, i) => sum + (lockedChecked[i] && lc.type !== "under5" ? (lc.cost ?? 0) : 0), 0);
        const openCostDisplay =
          openAdults  * (g.adult_cost   ?? 0) +
          openOver12  * (g.over12_cost  ?? 0) +
          openUnder12 * (g.under12_cost ?? 0);
        const totalCost = lockedCostDisplay + openCostDisplay;

        const totalAttending = lockedChecked.filter(Boolean).length + totalOpen;

        return (
          <div className="space-y-4">

            {/* Tarjeta invitado + DNI */}
            <div className="p-5 bg-white border border-wedding-gold/30 rounded-lg shadow-sm space-y-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  {(locked.length > 0 || hasAnyOpen) ? "Los encontramos 🥳" : "Te encontramos 🥳"}
                </p>
                <p className="font-display text-xl text-wedding-dark">{g.full_name}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Tu DNI <span className="text-destructive">*</span>
                </p>
                <Input placeholder="Número de DNI" value={dni} onChange={e => setDni(e.target.value)}
                  className="bg-wedding-cream/50" inputMode="numeric" />
              </div>
              <div className="space-y-1.5">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Tu menú</p>
                <MenuToggle value={mainMenu} onChange={setMainMenu} />
              </div>
            </div>

            {/* Lista cerrada */}
            {locked.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Acompañantes a confirmar:
                </p>
                <div className="bg-white border border-wedding-gold/20 rounded-lg overflow-hidden">
                  {locked.map((lc, i) => {
                    const badge = TYPE_BADGE[lc.type];
                    const isChecked = lockedChecked[i] ?? true;
                    return (
                      <div key={i} className={`p-3 ${i > 0 ? "border-t border-wedding-gold/10" : ""}`}>
                        <label className="flex items-center gap-3 cursor-pointer hover:bg-wedding-cream/40 transition-colors rounded">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => setLockedChecked(prev => {
                              const next = [...prev];
                              next[i] = !next[i];
                              return next;
                            })}
                            className="w-4 h-4 accent-wedding-gold"
                          />
                          <span className="flex-1 text-sm text-wedding-dark">{lc.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded border font-medium ${badge.className}`}>
                            {badge.label}
                          </span>
                        </label>
                        {isChecked && lc.type !== "under5" && (
                          <div className="mt-2 ml-7">
                            <MenuToggle
                              value={lockedMenus[i] ?? "Ninguno"}
                              onChange={v => setLockedMenus(prev => { const n = [...prev]; n[i] = v; return n; })}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {lockedChecked.some(c => !c) && (
                  <p className="text-xs text-muted-foreground text-center">
                    Las personas destildadas no serán incluidas en la confirmación
                  </p>
                )}
              </div>
            )}

            {/* Acompañantes adicionales */}
            {hasAnyOpen && (
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Acompañantes adicionales
                </p>
                {hasOpenAdults && (
                  <CounterInput label="Adultos"
                    sublabel={g.adult_cost > 0 ? `$${g.adult_cost.toLocaleString("es-AR")} c/u · máx. ${g.max_adults}` : `máx. ${g.max_adults}`}
                    value={openAdults} max={g.max_adults}
                    onChange={v => { setOpenAdults(v); syncOpenNames(v, openOver12, openUnder12); }} />
                )}
                {hasOpenOver12 && (
                  <CounterInput label="Mayores de 12"
                    sublabel={g.over12_cost > 0 ? `$${g.over12_cost.toLocaleString("es-AR")} c/u · máx. ${g.max_over12}` : `máx. ${g.max_over12}`}
                    value={openOver12} max={g.max_over12}
                    onChange={v => { setOpenOver12(v); syncOpenNames(openAdults, v, openUnder12); }} />
                )}
                {hasOpenUnder12 && (
                  <CounterInput label="Menores de 12"
                    sublabel={g.under12_cost > 0 ? `$${g.under12_cost.toLocaleString("es-AR")} c/u · máx. ${g.max_under12}` : `máx. ${g.max_under12}`}
                    value={openUnder12} max={g.max_under12}
                    onChange={v => { setOpenUnder12(v); syncOpenNames(openAdults, openOver12, v); }} />
                )}

                {/* Nombres de acompañantes adicionales */}
                {totalOpen > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">Nombre de cada acompañante</p>
                    {Array.from({ length: openAdults }, (_, i) => (
                      <div key={`oa-${i}`} className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-wedding-gold bg-wedding-gold/10 border border-wedding-gold/30 rounded px-2 py-1 shrink-0 w-20 text-center">Adulto {i+1}</span>
                          <Input placeholder="Nombre completo" value={openNames[i] ?? ""}
                            onChange={e => { const n = [...openNames]; n[i] = e.target.value; setOpenNames(n); }}
                            className="bg-white text-sm" />
                        </div>
                        <div className="ml-[5.5rem]">
                          <MenuToggle value={openMenus[i] ?? "Ninguno"}
                            onChange={v => setOpenMenus(prev => { const n = [...prev]; n[i] = v; return n; })} />
                        </div>
                      </div>
                    ))}
                    {Array.from({ length: openOver12 }, (_, i) => (
                      <div key={`oo-${i}`} className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 rounded px-2 py-1 shrink-0 w-20 text-center">+12 · {i+1}</span>
                          <Input placeholder="Nombre completo" value={openNames[openAdults + i] ?? ""}
                            onChange={e => { const n = [...openNames]; n[openAdults + i] = e.target.value; setOpenNames(n); }}
                            className="bg-white text-sm" />
                        </div>
                        <div className="ml-[5.5rem]">
                          <MenuToggle value={openMenus[openAdults + i] ?? "Ninguno"}
                            onChange={v => setOpenMenus(prev => { const n = [...prev]; n[openAdults + i] = v; return n; })} />
                        </div>
                      </div>
                    ))}
                    {Array.from({ length: openUnder12 }, (_, i) => (
                      <div key={`ou-${i}`} className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-blue-500 bg-blue-50 border border-blue-200 rounded px-2 py-1 shrink-0 w-20 text-center">-12 · {i+1}</span>
                          <Input placeholder="Nombre completo" value={openNames[openAdults + openOver12 + i] ?? ""}
                            onChange={e => { const n = [...openNames]; n[openAdults + openOver12 + i] = e.target.value; setOpenNames(n); }}
                            className="bg-white text-sm" />
                        </div>
                        <div className="ml-[5.5rem]">
                          <MenuToggle value={openMenus[openAdults + openOver12 + i] ?? "Ninguno"}
                            onChange={v => setOpenMenus(prev => { const n = [...prev]; n[openAdults + openOver12 + i] = v; return n; })} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Resumen costo */}
            {totalAttending > 0 && totalCost > 0 && (
              <div className="text-center p-3 bg-wedding-cream rounded-lg border border-wedding-gold/20">
                <p className="text-sm text-muted-foreground">Total acompañantes ({totalAttending} {totalAttending === 1 ? "persona" : "personas"})</p>
                <p className="font-display text-2xl text-wedding-gold mt-1">${totalCost.toLocaleString("es-AR")}</p>
              </div>
            )}
            {totalCost === 0 && (
              <div className="text-center p-3 bg-wedding-cream rounded-lg border border-wedding-gold/20">
                <p className="text-sm text-wedding-gold font-medium">
                    {groomName ? `${brideName} y ${groomName} invitan` : `${brideName} invitan`} 😉
                  </p>
              </div>
            )}

            {confirmError && <p className="text-sm text-destructive text-center">{confirmError}</p>}

            <Button onClick={handleConfirm} disabled={confirming}
              className="w-full h-12 bg-wedding-gold hover:bg-wedding-gold/90 text-white text-base">
              {confirming ? "Confirmando..." : "Confirmar asistencia ✓"}
            </Button>
            <Button variant="outline" onClick={handleReset} className="w-full">Volver a buscar</Button>
          </div>
        );
      })()}

      {/* Éxito */}
      {state.status === "success" && (() => {
        const frase = state.frase;
        const weddingDate = process.env.NEXT_PUBLIC_WEDDING_DATE;
        const venueName = process.env.NEXT_PUBLIC_VENUE_NAME;
        const venueAddress = process.env.NEXT_PUBLIC_VENUE_ADDRESS;
        const dateFormatted = weddingDate
          ? new Date(weddingDate + "T12:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
          : "el gran día";
        return (
          <div className="text-center space-y-6 py-6">
            <div className="text-6xl">🎉</div>
            <div>
              <p className="font-display text-2xl text-wedding-dark">¡Confirmación recibida!</p>
              <p className="text-muted-foreground mt-2 capitalize">
                Nos vemos el <span className="text-wedding-dark font-medium">{dateFormatted}</span>
              </p>
            </div>
            <div className="px-4 py-3 bg-wedding-gold/10 border border-wedding-gold/30 rounded-lg">
              <p className="text-sm text-wedding-dark italic leading-relaxed">"{frase}"</p>
            </div>
            <div className="space-y-3 text-left">
              {(venueName || venueAddress) && (
                <div className="flex gap-3 p-3 bg-white rounded-lg border border-wedding-gold/20">
                  <span className="text-lg shrink-0">📍</span>
                  <div>
                    <p className="text-sm font-medium text-wedding-dark">Recordá la dirección del evento</p>
                    {venueName && <p className="text-sm text-muted-foreground">{venueName}</p>}
                    {venueAddress && <p className="text-xs text-muted-foreground">{venueAddress}</p>}
                  </div>
                </div>
              )}
              {onOpenRegalos ? (
                <button onClick={onOpenRegalos} className="w-full flex gap-3 p-3 bg-white rounded-lg border border-wedding-gold/20 hover:border-wedding-gold/50 transition-colors group text-left">
                  <span className="text-lg shrink-0">🎁</span>
                  <div>
                    <p className="text-sm font-medium text-wedding-dark group-hover:text-wedding-gold transition-colors">Ayudanos a cumplir nuestro sueño</p>
                    <p className="text-xs text-muted-foreground">Ver info de regalos →</p>
                  </div>
                </button>
              ) : (
                <a href="/regalos" className="flex gap-3 p-3 bg-white rounded-lg border border-wedding-gold/20 hover:border-wedding-gold/50 transition-colors group">
                  <span className="text-lg shrink-0">🎁</span>
                  <div>
                    <p className="text-sm font-medium text-wedding-dark group-hover:text-wedding-gold transition-colors">Ayudanos a cumplir nuestro sueño</p>
                    <p className="text-xs text-muted-foreground">Ir a la sección regalos →</p>
                  </div>
                </a>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
