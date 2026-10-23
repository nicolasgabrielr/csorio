"use client";

import { useState } from "react";
import { updateSettings } from "@/actions/settings";
import type { AppSettings, Accommodation, TransportOption, EventItem } from "@/lib/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm text-wedding-dark">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full"
      />
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border p-6 space-y-4">
      <h2 className="font-display text-lg text-wedding-dark border-b border-wedding-gold/20 pb-2">
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function ConfiguracionForm({ initialSettings }: { initialSettings: AppSettings }) {
  const [form, setForm] = useState<AppSettings>(initialSettings);
  const [accommodations, setAccommodations] = useState<Accommodation[]>(() => {
    try {
      return JSON.parse(initialSettings.accommodations || "[]");
    } catch {
      return [];
    }
  });
  const [transport, setTransport] = useState<TransportOption[]>(() => {
    try {
      return JSON.parse(initialSettings.transport_options || "[]");
    } catch {
      return [];
    }
  });
  const [events, setEvents] = useState<EventItem[]>(() => {
    try {
      return JSON.parse(initialSettings.events || "[]");
    } catch {
      return [];
    }
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set(key: keyof AppSettings) {
    return (v: string) => setForm((f) => ({ ...f, [key]: v }));
  }

  function updateAccommodation(index: number, field: keyof Accommodation, value: string) {
    setAccommodations((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function addAccommodation() {
    setAccommodations((prev) => [...prev, { nombre: "", descripcion: "", url: "" }]);
  }

  function removeAccommodation(index: number) {
    setAccommodations((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaving(true);
    const dataToSave: AppSettings = {
      ...form,
      accommodations: JSON.stringify(accommodations),
      transport_options: JSON.stringify(transport),
      events: JSON.stringify(events),
    };
    await updateSettings(dataToSave);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Evento */}
      <SectionCard title="Evento">
        <Field label="Nombre de la novia" value={form.bride_name} onChange={set("bride_name")} placeholder="Novia" />
        <Field label="Nombre del novio" value={form.groom_name} onChange={set("groom_name")} placeholder="Novio" />
        <Field label="Fecha de la boda" value={form.wedding_date} onChange={set("wedding_date")} placeholder="YYYY-MM-DD" type="date" />
      </SectionCard>

      {/* Lugar */}
      <SectionCard title="Lugar">
        <Field label="Nombre del salón" value={form.venue_name} onChange={set("venue_name")} placeholder="Casa Luoni Hotel Boutique" />
        <Field label="Dirección" value={form.venue_address} onChange={set("venue_address")} placeholder="RP 9, Estancia Grande, San Luis" />
        <Field label="Link Google Maps" value={form.venue_maps_url} onChange={set("venue_maps_url")} placeholder="https://maps.google.com/..." />
        <Field label="URL embed del mapa (iFrame src)" value={form.venue_maps_embed} onChange={set("venue_maps_embed")} placeholder="https://www.google.com/maps/embed?..." />
      </SectionCard>

      {/* Regalos — Texto */}
      <SectionCard title="Regalos — Texto">
        <div className="space-y-1.5">
          <Label className="text-sm text-wedding-dark">Texto de la sección</Label>
          <textarea
            value={form.gifts_body}
            onChange={e => setForm(f => ({ ...f, gifts_body: e.target.value }))}
            placeholder="Tu presencia es lo más importante para nosotros. Si además querés hacernos un regalo te contamos cómo hacerlo."
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
          />
        </div>
      </SectionCard>

      {/* Regalos ARS */}
      <SectionCard title="Regalos — Pesos (ARS)">
        <Field label="CBU" value={form.cbu_ars} onChange={set("cbu_ars")} placeholder="0000000000000000000000" />
        <Field label="Alias" value={form.alias_ars} onChange={set("alias_ars")} placeholder="mi.alias.pesos" />
        <Field label="Titular" value={form.holder_ars} onChange={set("holder_ars")} placeholder="Nombre Apellido" />
      </SectionCard>

      {/* Regalos USD */}
      <SectionCard title="Regalos — Dólares (USD)">
        <Field label="CBU" value={form.cbu_usd} onChange={set("cbu_usd")} placeholder="0000000000000000000000" />
        <Field label="Alias" value={form.alias_usd} onChange={set("alias_usd")} placeholder="mi.alias.dolares" />
        <Field label="Titular" value={form.holder_usd} onChange={set("holder_usd")} placeholder="Nombre Apellido" />
      </SectionCard>

      {/* Alojamientos */}
      <SectionCard title="Alojamientos recomendados">
        <div className="space-y-4">
          {accommodations.map((a, i) => (
            <div key={i} className="bg-muted/30 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Alojamiento {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeAccommodation(i)}
                  className="text-xs text-red-500 hover:text-red-700 transition-colors"
                >
                  Eliminar
                </button>
              </div>
              <Field
                label="Nombre"
                value={a.nombre}
                onChange={(v) => updateAccommodation(i, "nombre", v)}
                placeholder="Hotel Ejemplo"
              />
              <Field
                label="Descripción"
                value={a.descripcion}
                onChange={(v) => updateAccommodation(i, "descripcion", v)}
                placeholder="A 10 km del salón"
              />
              <Field
                label="URL (opcional)"
                value={a.url}
                onChange={(v) => updateAccommodation(i, "url", v)}
                placeholder="https://..."
              />
            </div>
          ))}

          <button
            type="button"
            onClick={addAccommodation}
            className="w-full py-2.5 border-2 border-dashed border-wedding-gold/30 rounded-lg text-sm text-wedding-gold hover:border-wedding-gold/60 hover:bg-wedding-gold/5 transition-colors"
          >
            + Agregar alojamiento
          </button>
        </div>
      </SectionCard>

      {/* Transporte */}
      <SectionCard title="Cómo llegar">
        <div className="space-y-4">
          {transport.map((t, i) => (
            <div key={i} className="bg-muted/30 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Opción {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => setTransport(prev => prev.filter((_, j) => j !== i))}
                  className="text-xs text-red-500 hover:text-red-700 transition-colors"
                >
                  Eliminar
                </button>
              </div>
              <div className="grid grid-cols-[80px_1fr] gap-3">
                <Field
                  label="Emoji"
                  value={t.emoji}
                  onChange={v => setTransport(prev => { const n = [...prev]; n[i] = { ...n[i], emoji: v }; return n; })}
                  placeholder="🚗"
                />
                <Field
                  label="Título"
                  value={t.title}
                  onChange={v => setTransport(prev => { const n = [...prev]; n[i] = { ...n[i], title: v }; return n; })}
                  placeholder="En auto"
                />
              </div>
              <Field
                label="Descripción"
                value={t.description}
                onChange={v => setTransport(prev => { const n = [...prev]; n[i] = { ...n[i], description: v }; return n; })}
                placeholder="Hay estacionamiento disponible en el lugar"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => setTransport(prev => [...prev, { emoji: "", title: "", description: "" }])}
            className="w-full py-2.5 border-2 border-dashed border-wedding-gold/30 rounded-lg text-sm text-wedding-gold hover:border-wedding-gold/60 hover:bg-wedding-gold/5 transition-colors"
          >
            + Agregar opción
          </button>
        </div>
      </SectionCard>

      {/* Búsqueda */}
      <SectionCard title="Búsqueda de invitados">
        <label className="flex items-center justify-between gap-4 cursor-pointer">
          <div>
            <p className="text-sm font-medium text-wedding-dark">Sugerencias de lista cerrada</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Si alguien no está en la lista principal, sugerir que puede estar en la lista de otro invitado.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.companion_suggestions === "true"}
            onClick={() => set("companion_suggestions")(form.companion_suggestions === "true" ? "false" : "true")}
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${
              form.companion_suggestions === "true" ? "bg-wedding-gold" : "bg-muted"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform ${
                form.companion_suggestions === "true" ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </label>
      </SectionCard>

      {/* Página principal */}
      <SectionCard title="Página principal">
        <p className="text-xs text-muted-foreground -mt-1">Textos que aparecen en la home.</p>
        <div className="space-y-4">
          <div className="border-b border-muted pb-4 space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Galería de fotos</p>
            <Field label='Título (ej. "Momentos únicos")' value={form.gallery_title} onChange={set("gallery_title")} placeholder="Momentos únicos" />
            <Field label='Subtítulo (ej. "Álbum de Fotos")' value={form.gallery_subtitle} onChange={set("gallery_subtitle")} placeholder="Álbum de Fotos" />
          </div>
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Sección RSVP</p>
            <Field label="Texto principal" value={form.rsvp_text} onChange={set("rsvp_text")} placeholder="Esperamos contar con tu presencia" />
            <Field label="Fecha límite de confirmación" value={form.rsvp_deadline} onChange={set("rsvp_deadline")} placeholder="YYYY-MM-DD" type="date" />
            <p className="text-xs text-muted-foreground">Vacío = usa la fecha de la boda como límite.</p>
          </div>
        </div>
      </SectionCard>

      {/* Eventos */}
      <SectionCard title="Eventos (Ceremonia · Fiesta)">
        <p className="text-xs text-muted-foreground -mt-1">
          Estos aparecen como tarjetas en la página principal. Podés editar título, lugar, dirección, fecha, hora e ícono.
        </p>
        <div className="space-y-4">
          {events.map((ev, i) => (
            <div key={i} className="bg-muted/30 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Evento {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => setEvents(prev => prev.filter((_, j) => j !== i))}
                  className="text-xs text-red-500 hover:text-red-700 transition-colors"
                >
                  Eliminar
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Título"
                  value={ev.title}
                  onChange={v => setEvents(prev => { const n = [...prev]; n[i] = { ...n[i], title: v }; return n; })}
                  placeholder="Ceremonia"
                />
                <div className="space-y-1.5">
                  <Label className="text-sm text-wedding-dark">Ícono</Label>
                  <select
                    value={ev.icon}
                    onChange={e => setEvents(prev => { const n = [...prev]; n[i] = { ...n[i], icon: e.target.value as "church" | "civil" | "party" }; return n; })}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="church">⛪ Ceremonia</option>
                    <option value="civil">📋 Civil</option>
                    <option value="party">🥂 Festejo</option>
                  </select>
                </div>
              </div>
              <Field
                label="Nombre del lugar"
                value={ev.venue}
                onChange={v => setEvents(prev => { const n = [...prev]; n[i] = { ...n[i], venue: v }; return n; })}
                placeholder="Parroquia Nuestra Señora del Rosario"
              />
              <Field
                label="Dirección"
                value={ev.address}
                onChange={v => setEvents(prev => { const n = [...prev]; n[i] = { ...n[i], address: v }; return n; })}
                placeholder="Av. Corrientes 1234, Buenos Aires"
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Fecha"
                  value={ev.date}
                  onChange={v => setEvents(prev => { const n = [...prev]; n[i] = { ...n[i], date: v }; return n; })}
                  placeholder="8 de Octubre"
                />
                <Field
                  label="Hora"
                  value={ev.time}
                  onChange={v => setEvents(prev => { const n = [...prev]; n[i] = { ...n[i], time: v }; return n; })}
                  placeholder="12:00 hs"
                />
              </div>
              <Field
                label="Link Google Maps"
                value={ev.maps_url}
                onChange={v => setEvents(prev => { const n = [...prev]; n[i] = { ...n[i], maps_url: v }; return n; })}
                placeholder="https://maps.google.com/..."
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => setEvents(prev => [...prev, { title: "", venue: "", address: "", date: "", time: "", maps_url: "", icon: "church" as const }])}
            className="w-full py-2.5 border-2 border-dashed border-wedding-gold/30 rounded-lg text-sm text-wedding-gold hover:border-wedding-gold/60 hover:bg-wedding-gold/5 transition-colors"
          >
            + Agregar evento
          </button>
        </div>
      </SectionCard>

      {/* Guardar */}
      <Button
        onClick={handleSave}
        disabled={saving}
        className={`w-full ${saved ? "bg-green-600 hover:bg-green-600" : "bg-wedding-gold hover:bg-wedding-gold/90"} text-white transition-colors`}
      >
        {saving ? "Guardando..." : saved ? "✓ Guardado" : "Guardar configuración"}
      </Button>
    </div>
  );
}
