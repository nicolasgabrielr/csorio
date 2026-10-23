"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { togglePayment, deleteConfirmation } from "@/actions/confirmations";
import type { Confirmation, CompanionType } from "@/lib/supabase";

const TYPE_BADGE: Record<CompanionType, { label: string; className: string }> = {
  adult:   { label: "Adulto",      className: "border-wedding-gold/30 text-wedding-gold bg-wedding-gold/5" },
  over12:  { label: "Mayor de 12", className: "border-orange-200 text-orange-600 bg-orange-50" },
  under12: { label: "Menor de 12", className: "border-blue-200 text-blue-600 bg-blue-50" },
  under5:  { label: "Menor de 5",  className: "border-purple-200 text-purple-600 bg-purple-50" },
};

const MENU_BADGE: Record<string, string> = {
  Celiaco:     "bg-amber-50 border-amber-200 text-amber-700",
  Vegetariano: "bg-green-50 border-green-200 text-green-700",
  Vegano:      "bg-emerald-50 border-emerald-200 text-emerald-700",
};

function DeleteBtn({ id, name, onDeleted }: { id: string; name: string; onDeleted: () => void }) {
  const [confirm, setConfirm] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="text-xs text-red-400 hover:text-red-600 transition-colors"
        title="Cancelar confirmación"
      >
        Cancelar
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-red-600">¿Seguro?</span>
      <button
        onClick={() => startTransition(async () => {
          const res = await deleteConfirmation(id);
          if (res.success) onDeleted();
        })}
        disabled={pending}
        className="text-xs font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"
      >
        Sí
      </button>
      <button onClick={() => setConfirm(false)} className="text-xs text-muted-foreground hover:text-foreground">
        No
      </button>
    </div>
  );
}

function PayToggle({ id, initialPaid, cost }: { id: string; initialPaid: boolean; cost: number }) {
  const [paid, setPaid] = useState(initialPaid);
  const [pending, startTransition] = useTransition();

  function handle() {
    const next = !paid;
    setPaid(next);
    startTransition(async () => {
      const res = await togglePayment(id, next);
      if (!res.success) setPaid(!next); // revert on error
    });
  }

  if (cost === 0) return <span className="text-muted-foreground text-xs">—</span>;

  return (
    <button
      onClick={handle}
      disabled={pending}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
        paid
          ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
          : "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
      } disabled:opacity-50`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${paid ? "bg-green-500" : "bg-orange-400"}`} />
      {paid ? "Pagó" : "Pendiente"}
    </button>
  );
}

export default function ConfirmadosClient({ confirmations: initial }: { confirmations: Confirmation[] }) {
  const router = useRouter();
  const [confirmations, setConfirmations] = useState(initial);

  const totalAdults  = confirmations.reduce((s, c) => s + (c.adult_count  ?? 0), 0);
  const totalOver12  = confirmations.reduce((s, c) => s + (c.over12_count  ?? 0), 0);
  const totalUnder12 = confirmations.reduce((s, c) => s + (c.under12_count ?? 0), 0);
  const totalUnder5  = confirmations.reduce((s, c) => s + (c.under5_count  ?? 0), 0);
  const totalPeople  = confirmations.length + totalAdults + totalOver12 + totalUnder12 + totalUnder5;

  const withCost   = confirmations.filter(c => c.total_cost > 0);
  const totalDebt  = withCost.reduce((s, c) => s + (c.total_cost ?? 0), 0);
  const totalPaid  = withCost.filter(c => c.paid).reduce((s, c) => s + (c.total_cost ?? 0), 0);
  const totalOwed  = totalDebt - totalPaid;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-wedding-dark">Confirmados</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {confirmations.length} confirmaciones — {totalPeople} personas en total
        </p>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invitado</TableHead>
              <TableHead>DNI</TableHead>
              <TableHead>Acompañantes</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-center">Pago</TableHead>
              <TableHead className="text-right">Fecha</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {confirmations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Todavía no hay confirmaciones
                </TableCell>
              </TableRow>
            ) : (
              confirmations.map(c => {
                const companions = Array.isArray(c.companions) ? c.companions : [];
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      <div>{c.guests?.full_name ?? "—"}</div>
                      {c.main_menu && c.main_menu !== "Ninguno" && (
                        <span className={`inline-block mt-0.5 text-xs px-1.5 py-0.5 rounded border ${MENU_BADGE[c.main_menu] ?? ""}`}>
                          {c.main_menu}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono">
                      {c.dni || <span className="text-muted-foreground/50">—</span>}
                    </TableCell>
                    <TableCell>
                      {companions.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {companions.map((comp, i) => {
                            const badge = TYPE_BADGE[comp.type as CompanionType] ?? TYPE_BADGE.adult;
                            const menuBadge = comp.menu && comp.menu !== "Ninguno" ? MENU_BADGE[comp.menu] : null;
                            return (
                              <Badge key={i} variant="outline" className={`text-xs ${badge.className}`}>
                                {comp.name}
                                <span className="ml-1 opacity-60">· {badge.label}</span>
                                {menuBadge && (
                                  <span className={`ml-1.5 px-1 rounded border text-xs ${menuBadge}`}>{comp.menu}</span>
                                )}
                              </Badge>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-muted-foreground/50 text-sm">Solo</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {c.total_cost > 0
                        ? `$${Number(c.total_cost).toLocaleString("es-AR")}`
                        : <span className="text-muted-foreground text-sm">Invitados</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      <PayToggle id={c.id} initialPaid={c.paid ?? false} cost={c.total_cost} />
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(c.confirmed_at).toLocaleDateString("es-AR", {
                        day: "2-digit", month: "2-digit", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <DeleteBtn
                        id={c.id}
                        name={c.guests?.full_name ?? ""}
                        onDeleted={() => {
                          setConfirmations(prev => prev.filter(x => x.id !== c.id));
                          router.refresh();
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {confirmations.length > 0 && (
        <div className="mt-4 p-4 bg-wedding-cream rounded-lg border border-wedding-gold/30 flex flex-wrap gap-4 justify-between items-end">
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Adultos: <strong className="text-foreground">{totalAdults + confirmations.length}</strong></p>
            <p>Mayores de 12: <strong className="text-foreground">{totalOver12}</strong></p>
            <p>Menores de 12: <strong className="text-foreground">{totalUnder12}</strong></p>
            {totalUnder5 > 0 && <p>Menores de 5: <strong className="text-purple-600">{totalUnder5}</strong></p>}
            <p>Total personas: <strong className="text-foreground">{totalPeople}</strong></p>
          </div>
          {totalDebt > 0 && (
            <div className="text-right space-y-1">
              <div>
                <p className="text-xs text-muted-foreground">Cobrado</p>
                <p className="text-xl font-bold text-green-700">${totalPaid.toLocaleString("es-AR")}</p>
              </div>
              {totalOwed > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground">Pendiente</p>
                  <p className="text-lg font-semibold text-orange-600">${totalOwed.toLocaleString("es-AR")}</p>
                </div>
              )}
              <div className="pt-1 border-t border-wedding-gold/20">
                <p className="text-xs text-muted-foreground">Recaudación total</p>
                <p className="text-2xl font-bold text-wedding-dark">${totalDebt.toLocaleString("es-AR")}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
