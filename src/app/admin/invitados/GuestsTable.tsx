"use client";

import { useState } from "react";
import { createGuest, updateGuest, deleteGuest, exportGuestsAsJson } from "@/actions/guests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";
import type { CompanionType } from "@/lib/supabase";
import type { Prices } from "@/lib/mock-db";

type LockedEntry = { name: string; type: CompanionType; cost: number };

type GuestWithStatus = {
  id: string;
  full_name: string;
  allows_companion: boolean;
  main_cost?: number;
  locked_companions: LockedEntry[];
  max_adults: number;
  adult_cost: number;
  max_over12: number;
  over12_cost: number;
  max_under12: number;
  under12_cost: number;
  phrase_type: "family" | "friends" | "custom";
  custom_phrase: string;
  created_at: string;
  confirmed: boolean;
};


type GuestForm = {
  full_name: string;
  allows_companion: boolean;
  main_cost: string;
  locked_companions: LockedEntry[];
  max_adults: string;
  adult_cost: string;
  max_over12: string;
  over12_cost: string;
  max_under12: string;
  under12_cost: string;
  phrase_type: "family" | "friends" | "custom";
  custom_phrase: string;
};

const emptyForm: GuestForm = {
  full_name: "",
  allows_companion: false,
  main_cost: "0",
  locked_companions: [],
  max_adults: "0",
  adult_cost: "0",
  max_over12: "0",
  over12_cost: "0",
  max_under12: "0",
  under12_cost: "0",
  phrase_type: "friends",
  custom_phrase: "",
};

const TYPE_LABELS: Record<CompanionType, string> = {
  adult: "Adulto",
  over12: "Mayor de 12",
  under12: "Menor de 12",
  under5: "Menor de 5",
};

function CompanionRow({
  label,
  maxValue,
  costValue,
  defaultCost,
  onMaxChange,
  onCostChange,
}: {
  label: string;
  maxValue: string;
  costValue: string;
  defaultCost: number;
  onMaxChange: (v: string) => void;
  onCostChange: (v: string) => void;
}) {
  const cobrable = parseFloat(costValue) > 0;
  const active = parseInt(maxValue) > 0;

  return (
    <div className="p-3 bg-muted/50 rounded-lg space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <div className="flex items-end gap-3">
        <div className="space-y-1 w-24">
          <Label className="text-xs">Máximo</Label>
          <Input type="number" min="0" step="1" value={maxValue} onChange={e => onMaxChange(e.target.value)} placeholder="0" />
        </div>
        {active && (
          <label className="flex items-center gap-2 cursor-pointer pb-1">
            <input
              type="checkbox"
              checked={cobrable}
              onChange={() => onCostChange(cobrable ? "0" : defaultCost.toString())}
              className="w-4 h-4 accent-wedding-gold"
            />
            <span className="text-sm text-wedding-dark">¿Se cobra?</span>
            {cobrable
              ? <span className="text-xs text-muted-foreground">${parseFloat(costValue).toLocaleString("es-AR")}</span>
              : <span className="text-xs text-wedding-gold">Los novios invitan 😉</span>}
          </label>
        )}
      </div>
      {active && cobrable && (
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground shrink-0">Precio ($)</Label>
          <Input
            type="number" min="0" step="100"
            value={costValue}
            onChange={e => onCostChange(e.target.value)}
            placeholder="Precio por persona"
            className="h-7 text-xs"
          />
          <span className="text-xs text-muted-foreground whitespace-nowrap">c/u</span>
        </div>
      )}
    </div>
  );
}

export default function GuestsTable({
  guests,
  defaultPrices,
}: {
  guests: GuestWithStatus[];
  defaultPrices: Prices;
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<GuestWithStatus | null>(null);
  const [guestToDelete, setGuestToDelete] = useState<GuestWithStatus | null>(null);
  const [form, setForm] = useState<GuestForm>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  type SortKey = "name" | "locked_free" | "locked_paid" | "confirmed";
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(a => !a);
    else { setSortKey(key); setSortAsc(false); } // numéricos: mayor primero por defecto
  }

  const filteredGuests = guests
    .filter(g => g.full_name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let diff = 0;
      if (sortKey === "name") {
        diff = a.full_name.localeCompare(b.full_name, "es");
      } else if (sortKey === "locked_free") {
        diff = (a.locked_companions ?? []).filter(lc => lc.cost === 0).length
             - (b.locked_companions ?? []).filter(lc => lc.cost === 0).length;
      } else if (sortKey === "locked_paid") {
        diff = (a.locked_companions ?? []).filter(lc => lc.cost > 0).length
             - (b.locked_companions ?? []).filter(lc => lc.cost > 0).length;
      } else if (sortKey === "confirmed") {
        diff = Number(a.confirmed) - Number(b.confirmed);
      }
      return sortAsc ? diff : -diff;
    });

  // Totales globales (sobre todos los invitados, no solo los filtrados)
  const stats = guests.reduce(
    (acc, g) => {
      const locked = g.locked_companions ?? [];
      const mainPays = (g.main_cost ?? 0) > 0;
      acc.lockedFree        += (mainPays ? 0 : 1) + locked.filter(lc => lc.cost === 0 || lc.type === "under5").length;
      acc.lockedPaid        += (mainPays ? 1 : 0) + locked.filter(lc => lc.cost > 0 && lc.type !== "under5").length;
      acc.lockedPaidAmount  += (g.main_cost ?? 0) + locked.reduce((s, lc) => s + (lc.type === "under5" ? 0 : (lc.cost ?? 0)), 0);
      acc.freeAdults        += (mainPays ? 0 : 1) + locked.filter(lc => (lc.cost === 0 || lc.type === "under5") && lc.type === "adult").length;
      acc.freeOver12        += locked.filter(lc => (lc.cost === 0 || lc.type === "under5") && lc.type === "over12").length;
      acc.freeUnder12       += locked.filter(lc => (lc.cost === 0 || lc.type === "under5") && lc.type === "under12").length;
      acc.freeUnder5        += locked.filter(lc => lc.type === "under5").length;
      acc.openMax           += (g.max_adults ?? 0) + (g.max_over12 ?? 0) + (g.max_under12 ?? 0);
      acc.openAmount        +=
        (g.max_adults ?? 0) * (g.adult_cost ?? 0) +
        (g.max_over12 ?? 0) * (g.over12_cost ?? 0) +
        (g.max_under12 ?? 0) * (g.under12_cost ?? 0);
      return acc;
    },
    { lockedFree: 0, lockedPaid: 0, lockedPaidAmount: 0, freeAdults: 0, freeOver12: 0, freeUnder12: 0, freeUnder5: 0, openMax: 0, openAmount: 0 },
  );

  function openCreate() {
    setEditingGuest(null);
    setForm(emptyForm);
    setError("");
    setDialogOpen(true);
  }

  function openEdit(guest: GuestWithStatus) {
    setEditingGuest(guest);
    setForm({
      full_name: guest.full_name,
      allows_companion: guest.allows_companion,
      main_cost: (guest.main_cost ?? 0).toString(),
      locked_companions: [...(guest.locked_companions ?? [])],
      max_adults: guest.max_adults.toString(),
      adult_cost: guest.adult_cost.toString(),
      max_over12: guest.max_over12.toString(),
      over12_cost: guest.over12_cost.toString(),
      max_under12: guest.max_under12.toString(),
      under12_cost: guest.under12_cost.toString(),
      phrase_type: guest.phrase_type ?? "friends",
      custom_phrase: guest.custom_phrase ?? "",
    });
    setError("");
    setDialogOpen(true);
  }

  // Helpers para lista cerrada
  function addLocked() {
    setForm(f => ({ ...f, locked_companions: [...f.locked_companions, { name: "", type: "adult", cost: 0 }] }));
  }
  function removeLocked(i: number) {
    setForm(f => ({ ...f, locked_companions: f.locked_companions.filter((_, idx) => idx !== i) }));
  }
  function updateLocked(i: number, field: keyof LockedEntry, value: string) {
    setForm(f => {
      const next = [...f.locked_companions];
      const updated = { ...next[i], [field]: field === "cost" ? parseFloat(value) || 0 : value };
      // under5 siempre sin costo
      if (field === "type" && value === "under5") updated.cost = 0;
      next[i] = updated;
      return { ...f, locked_companions: next };
    });
  }

  async function handleSave() {
    if (!form.full_name.trim()) { setError("El nombre es obligatorio"); return; }
    for (const lc of form.locked_companions) {
      if (!lc.name.trim()) { setError("Completá el nombre de todos los acompañantes de la lista cerrada"); return; }
    }
    setLoading(true);
    setError("");

    const data = {
      full_name: form.full_name.trim(),
      allows_companion: form.allows_companion,
      main_cost: parseFloat(form.main_cost) || 0,
      locked_companions: form.locked_companions.map(lc => ({ name: lc.name.trim(), type: lc.type, cost: lc.cost ?? 0 })),
      max_adults: parseInt(form.max_adults) || 0,
      adult_cost: parseFloat(form.adult_cost) || 0,
      max_over12: parseInt(form.max_over12) || 0,
      over12_cost: parseFloat(form.over12_cost) || 0,
      max_under12: parseInt(form.max_under12) || 0,
      under12_cost: parseFloat(form.under12_cost) || 0,
      phrase_type: form.phrase_type,
      custom_phrase: form.custom_phrase.trim(),
    };

    const result = editingGuest
      ? await updateGuest(editingGuest.id, data)
      : await createGuest(data);

    setLoading(false);
    if (!result.success) { setError(result.error ?? "Error al guardar"); return; }
    setDialogOpen(false);
    router.refresh();
  }

  async function handleExport() {
    const json = await exportGuestsAsJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "guests.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDelete() {
    if (!guestToDelete) return;
    setLoading(true);
    await deleteGuest(guestToDelete.id);
    setLoading(false);
    setDeleteDialogOpen(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <Input
          placeholder="Buscar por nombre..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" onClick={handleExport} className="text-muted-foreground">
            ↓ Exportar JSON
          </Button>
          <Button onClick={openCreate} className="bg-wedding-gold hover:bg-wedding-gold/90 text-white">
            + Agregar invitado
          </Button>
        </div>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="rounded-lg border border-pink-200 bg-pink-50/60 px-3 py-2.5">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Sin cargo (titular + lista)</p>
          <p className="text-2xl font-bold text-pink-600 mt-0.5">{stats.lockedFree}</p>
          <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
            <p>Adultos: <span className="font-medium text-wedding-gold">{stats.freeAdults}</span></p>
            {stats.freeOver12  > 0 && <p>+12: <span className="font-medium text-orange-500">{stats.freeOver12}</span></p>}
            {stats.freeUnder12 > 0 && <p>−12: <span className="font-medium text-blue-500">{stats.freeUnder12}</span></p>}
            {stats.freeUnder5  > 0 && <p>−5: <span className="font-medium text-purple-500">{stats.freeUnder5}</span></p>}
          </div>
        </div>
        <div className="rounded-lg border border-wedding-gold/30 bg-wedding-gold/5 px-3 py-2.5">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Lista cerrada con cobro</p>
          <p className="text-2xl font-bold text-wedding-dark mt-0.5">{stats.lockedPaid}</p>
          <p className="text-xs text-muted-foreground">{stats.lockedPaidAmount > 0 ? `$${stats.lockedPaidAmount.toLocaleString("es-AR")} total` : "—"}</p>
        </div>
        <div className="rounded-lg border border-blue-200 bg-blue-50/50 px-3 py-2.5">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Acomp. adicionales (máx)</p>
          <p className="text-2xl font-bold text-blue-600 mt-0.5">{stats.openMax}</p>
          <p className="text-xs text-muted-foreground">{stats.openAmount > 0 ? `máx. $${stats.openAmount.toLocaleString("es-AR")}` : "sin cargo"}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button onClick={() => toggleSort("name")} className="flex items-center gap-1 hover:text-wedding-dark transition-colors">
                  Nombre {sortKey === "name" ? (sortAsc ? "↑" : "↓") : <span className="opacity-30">↕</span>}
                </button>
              </TableHead>
              <TableHead>Lista cerrada</TableHead>
              <TableHead className="text-center">
                <button onClick={() => toggleSort("locked_free")} className="flex items-center gap-1 mx-auto hover:text-pink-600 transition-colors whitespace-nowrap">
                  LC sin cargo {sortKey === "locked_free" ? (sortAsc ? "↑" : "↓") : <span className="opacity-30">↕</span>}
                </button>
              </TableHead>
              <TableHead className="text-center">
                <button onClick={() => toggleSort("locked_paid")} className="flex items-center gap-1 mx-auto hover:text-wedding-dark transition-colors whitespace-nowrap">
                  LC con cargo {sortKey === "locked_paid" ? (sortAsc ? "↑" : "↓") : <span className="opacity-30">↕</span>}
                </button>
              </TableHead>
              <TableHead>Acomp. adicionales</TableHead>
              <TableHead className="text-center">
                <button onClick={() => toggleSort("confirmed")} className="flex items-center gap-1 mx-auto hover:text-wedding-dark transition-colors">
                  Confirmó {sortKey === "confirmed" ? (sortAsc ? "↑" : "↓") : <span className="opacity-30">↕</span>}
                </button>
              </TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGuests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  {search ? "No se encontraron invitados" : "No hay invitados cargados"}
                </TableCell>
              </TableRow>
            ) : (
              filteredGuests.map(guest => {
                const locked = guest.locked_companions ?? [];
                const hasExtra = guest.max_adults > 0 || guest.max_over12 > 0 || guest.max_under12 > 0;
                const lockedFreeCount = locked.filter(lc => lc.cost === 0).length;
                const lockedPaidCount = locked.filter(lc => lc.cost > 0).length;
                const lockedPaidAmount = locked.filter(lc => lc.cost > 0).reduce((s, lc) => s + lc.cost, 0);
                const lockedTotal = locked.reduce((s, lc) => s + (lc.cost ?? 0), 0);
                const openTotal =
                  (guest.max_adults ?? 0) * (guest.adult_cost ?? 0) +
                  (guest.max_over12 ?? 0) * (guest.over12_cost ?? 0) +
                  (guest.max_under12 ?? 0) * (guest.under12_cost ?? 0);
                return (
                  <TableRow key={guest.id}>
                    <TableCell className="font-medium">
                      <div>
                        <span>{guest.full_name}</span>
                        {(guest.main_cost ?? 0) > 0 && (
                          <p className="text-xs text-wedding-dark font-semibold mt-0.5">
                            Titular: ${(guest.main_cost ?? 0).toLocaleString("es-AR")}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {locked.length > 0 ? (
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap gap-1">
                            {locked.map((lc, i) => (
                              <span key={i} className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                                lc.type === "adult"  ? "bg-wedding-gold/10 text-wedding-gold border border-wedding-gold/30"
                                : lc.type === "over12" ? "bg-orange-50 text-orange-600 border border-orange-200"
                                : lc.type === "under5" ? "bg-purple-50 text-purple-600 border border-purple-200"
                                : "bg-blue-50 text-blue-600 border border-blue-200"
                              }`}>
                                {lc.name}
                              </span>
                            ))}
                          </div>
                          <p className={`text-xs font-semibold ${lockedTotal > 0 ? "text-wedding-dark" : "text-pink-600"}`}>
                            {lockedTotal > 0 ? `$${lockedTotal.toLocaleString("es-AR")}` : "Sin cargo 💑"}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {lockedFreeCount > 0
                        ? <span className="text-lg font-bold text-pink-600">{lockedFreeCount}</span>
                        : <span className="text-muted-foreground/40 text-sm">—</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      {lockedPaidCount > 0 ? (
                        <div>
                          <span className="text-lg font-bold text-wedding-dark">{lockedPaidCount}</span>
                          <p className="text-xs text-muted-foreground">${lockedPaidAmount.toLocaleString("es-AR")}</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/40 text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {hasExtra ? (
                        <div className="space-y-1">
                          <div className="space-y-0.5">
                            {guest.max_adults > 0 && <p>Adultos: {guest.max_adults}{guest.adult_cost > 0 ? ` ($${guest.adult_cost.toLocaleString("es-AR")})` : " (sin cargo)"}</p>}
                            {guest.max_over12 > 0 && <p>+12: {guest.max_over12}{guest.over12_cost > 0 ? ` ($${guest.over12_cost.toLocaleString("es-AR")})` : " (sin cargo)"}</p>}
                            {guest.max_under12 > 0 && <p>-12: {guest.max_under12}{guest.under12_cost > 0 ? ` ($${guest.under12_cost.toLocaleString("es-AR")})` : " (sin cargo)"}</p>}
                          </div>
                          <p className={`text-xs font-semibold ${openTotal > 0 ? "text-wedding-dark" : "text-pink-600"}`}>
                            {openTotal > 0 ? `máx. $${openTotal.toLocaleString("es-AR")}` : "Sin cargo 💑"}
                          </p>
                        </div>
                      ) : (
                        <span>—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {guest.confirmed
                        ? <Badge className="bg-green-100 text-green-700 border-0">✓ Sí</Badge>
                        : <Badge variant="outline" className="text-muted-foreground">Pendiente</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => openEdit(guest)}>Editar</Button>
                        <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => { setGuestToDelete(guest); setDeleteDialogOpen(true); }}>Eliminar</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog crear/editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingGuest ? "Editar invitado" : "Agregar invitado"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">

            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="full_name">Nombre completo</Label>
              <Input
                id="full_name"
                value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                placeholder="Ej: María García"
              />
            </div>

            {/* Costo del titular */}
            <div className="p-3 bg-muted/50 rounded-lg space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Titular</p>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={parseFloat(form.main_cost) > 0}
                  onChange={() => setForm(f => ({ ...f, main_cost: parseFloat(f.main_cost) > 0 ? "0" : defaultPrices.adult_cost.toString() }))}
                  className="w-4 h-4 accent-wedding-gold"
                />
                <span className="text-sm text-wedding-dark">¿El titular paga?</span>
                {parseFloat(form.main_cost) > 0
                  ? <span className="text-xs text-muted-foreground">${parseFloat(form.main_cost).toLocaleString("es-AR")}</span>
                  : <span className="text-xs text-wedding-gold">Los novios invitan 😉</span>}
              </label>
              {parseFloat(form.main_cost) > 0 && (
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground shrink-0">Precio ($)</Label>
                  <Input
                    type="number" min="0" step="100"
                    value={form.main_cost}
                    onChange={e => setForm(f => ({ ...f, main_cost: e.target.value }))}
                    className="h-7 text-xs"
                  />
                  <span className="text-xs text-muted-foreground">c/u</span>
                </div>
              )}
            </div>

            {/* Lista cerrada */}
            <div className="space-y-2">
              <div>
                <Label>Lista cerrada de acompañantes</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Personas que ya confirmaron su asistencia. El invitado puede desmarcarlas pero no agregar nuevas.
                </p>
              </div>
              {form.locked_companions.map((lc, i) => {
                const stdCost =
                  lc.type === "adult"   ? defaultPrices.adult_cost
                  : lc.type === "over12" ? defaultPrices.over12_cost
                  : defaultPrices.under12_cost;
                const cobrable = lc.cost > 0;
                return (
                  <div key={i} className="space-y-2 p-2.5 bg-muted/30 rounded-lg border border-border/50">
                    <div className="flex gap-2 items-center">
                      <Input
                        placeholder="Nombre completo"
                        value={lc.name}
                        onChange={e => updateLocked(i, "name", e.target.value)}
                        className="flex-1"
                      />
                      <select
                        value={lc.type}
                        onChange={e => updateLocked(i, "type", e.target.value as CompanionType)}
                        className="border border-input rounded-md px-2 py-2 text-sm bg-background"
                      >
                        <option value="adult">Adulto</option>
                        <option value="over12">Mayor de 12</option>
                        <option value="under12">Menor de 12</option>
                        <option value="under5">Menor de 5</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removeLocked(i)}
                        className="text-muted-foreground hover:text-destructive transition-colors px-1 text-lg leading-none"
                      >
                        ×
                      </button>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cobrable}
                        onChange={() => updateLocked(i, "cost", cobrable ? "0" : stdCost.toString())}
                        className="w-4 h-4 accent-wedding-gold"
                      />
                      <span className="text-xs text-wedding-dark">¿Se cobra?</span>
                      {cobrable
                        ? <span className="text-xs text-muted-foreground">${lc.cost.toLocaleString("es-AR")}</span>
                        : <span className="text-xs text-wedding-gold">Los novios invitan 😉</span>}
                    </label>
                    {cobrable && (
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-muted-foreground shrink-0">Precio ($)</Label>
                        <Input
                          type="number" min="0" step="100"
                          value={lc.cost}
                          onChange={e => updateLocked(i, "cost", e.target.value)}
                          className="h-7 text-xs"
                        />
                        <span className="text-xs text-muted-foreground">c/u</span>
                      </div>
                    )}
                  </div>
                );
              })}
              <Button type="button" variant="outline" size="sm" onClick={addLocked} className="w-full border-dashed">
                + Agregar persona a la lista
              </Button>
            </div>

            {/* Acompañantes adicionales */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="allows_companion"
                  checked={form.allows_companion}
                  onChange={e => setForm(f => ({
                    ...f,
                    allows_companion: e.target.checked,
                    ...(!e.target.checked && { max_adults: "0", adult_cost: "0", max_over12: "0", over12_cost: "0", max_under12: "0", under12_cost: "0" }),
                  }))}
                  className="w-4 h-4 accent-wedding-gold"
                />
                <Label htmlFor="allows_companion" className="cursor-pointer">Permite acompañantes adicionales</Label>
              </div>

              {form.allows_companion && (
                <div className="space-y-2">
                  <CompanionRow
                    label="Adultos"
                    maxValue={form.max_adults}
                    costValue={form.adult_cost}
                    defaultCost={defaultPrices.adult_cost}
                    onMaxChange={v => setForm(f => ({ ...f, max_adults: v }))}
                    onCostChange={v => setForm(f => ({ ...f, adult_cost: v }))}
                  />
                  <CompanionRow
                    label="Mayores de 12"
                    maxValue={form.max_over12}
                    costValue={form.over12_cost}
                    defaultCost={defaultPrices.over12_cost}
                    onMaxChange={v => setForm(f => ({ ...f, max_over12: v }))}
                    onCostChange={v => setForm(f => ({ ...f, over12_cost: v }))}
                  />
                  <CompanionRow
                    label="Menores de 12"
                    maxValue={form.max_under12}
                    costValue={form.under12_cost}
                    defaultCost={defaultPrices.under12_cost}
                    onMaxChange={v => setForm(f => ({ ...f, max_under12: v }))}
                    onCostChange={v => setForm(f => ({ ...f, under12_cost: v }))}
                  />
                </div>
              )}
            </div>

            {/* Tipo de frase */}
            <div className="space-y-2">
              <Label>Frase al confirmar</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["family", "friends", "custom"] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, phrase_type: type }))}
                    className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                      form.phrase_type === type
                        ? "border-wedding-gold bg-wedding-gold/10 text-wedding-dark"
                        : "border-border text-muted-foreground hover:border-wedding-gold/50"
                    }`}
                  >
                    {type === "family" ? "👨‍👩‍👧 Familia" : type === "friends" ? "🎉 Amigos" : "✏️ Personalizada"}
                  </button>
                ))}
              </div>
              {form.phrase_type === "custom" && (
                <Input
                  placeholder="Escribí la frase personalizada..."
                  value={form.custom_phrase}
                  onChange={e => setForm(f => ({ ...f, custom_phrase: e.target.value }))}
                />
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={loading} className="bg-wedding-gold hover:bg-wedding-gold/90 text-white">
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog eliminar */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Eliminar invitado</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            ¿Estás seguro que querés eliminar a{" "}
            <strong className="text-foreground">{guestToDelete?.full_name}</strong>?
            Esta acción no se puede deshacer.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
