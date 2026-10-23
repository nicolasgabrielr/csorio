"use server";

import { createAdminClient, supabase } from "@/lib/supabase";
import { mockDb } from "@/lib/mock-db";
import type { Confirmation, CompanionType } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

const USE_MOCK = !process.env.NEXT_PUBLIC_SUPABASE_URL;

export async function confirmAttendance(data: {
  guest_id: string;
  dni: string;
  adult_count: number;
  over12_count: number;
  under12_count: number;
  under5_count: number;
  companions: { name: string; type: CompanionType; menu?: string }[];
  main_menu?: string;
  total_cost: number;
}): Promise<{ success: boolean; error?: string }> {
  if (USE_MOCK) {
    if (mockDb.confirmations.findByGuestId(data.guest_id)) {
      return { success: false, error: "Este invitado ya confirmó su asistencia" };
    }
    mockDb.confirmations.create({ ...data, paid: false });
    return { success: true };
  }

  const { data: existing } = await supabase
    .from("confirmations").select("id").eq("guest_id", data.guest_id).limit(1);

  if (existing && existing.length > 0) {
    return { success: false, error: "Este invitado ya confirmó su asistencia" };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("confirmations").insert([data]);
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/confirmados");
  revalidatePath("/admin/metricas");
  return { success: true };
}

export async function togglePayment(
  confirmationId: string,
  paid: boolean,
): Promise<{ success: boolean; error?: string }> {
  if (USE_MOCK) {
    mockDb.confirmations.update(confirmationId, { paid });
    revalidatePath("/admin/confirmados");
    return { success: true };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("confirmations")
    .update({ paid })
    .eq("id", confirmationId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/confirmados");
  return { success: true };
}

export async function getConfirmedGuestIds(): Promise<Set<string>> {
  if (USE_MOCK) {
    const ids = mockDb.confirmations.list().map(c => c.guest_id);
    return new Set(ids);
  }

  const { data } = await supabase.from("confirmations").select("guest_id");
  return new Set((data ?? []).map((c: { guest_id: string }) => c.guest_id));
}

export async function deleteConfirmation(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  if (USE_MOCK) {
    mockDb.confirmations.delete(id);
    return { success: true };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("confirmations").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/confirmados");
  revalidatePath("/admin/metricas");
  return { success: true };
}

export async function listConfirmations(): Promise<Confirmation[]> {
  if (USE_MOCK) return mockDb.confirmations.list() as Confirmation[];

  const { data, error } = await supabase
    .from("confirmations")
    .select("*, guests(full_name, allows_companion)")
    .order("confirmed_at", { ascending: false });

  if (error) return [];
  return (data as Confirmation[]) ?? [];
}

// Calcula lo que absorben los novios por invitado:
// - Gap del titular (precio_estándar - main_cost)
// - Gap de cada acompañante (precio_estándar_por_tipo - costo_cobrado)
// - Menores de 5: no se cobran ni se cuentan como subsidio
function calcCoupleCover(
  mainCost: number,
  locked: { type: string; cost: number }[],
  prices: { adult_cost: number; over12_cost: number; under12_cost: number },
): number {
  const titularGap = Math.max(0, prices.adult_cost - mainCost);
  const companionGap = locked.reduce((s, lc) => {
    if (lc.type === "under5") return s;
    const std =
      lc.type === "adult"    ? prices.adult_cost
      : lc.type === "over12" ? prices.over12_cost
      : prices.under12_cost;
    return s + Math.max(0, std - (lc.cost ?? 0));
  }, 0);
  return titularGap + companionGap;
}

export async function getMetrics() {
  if (USE_MOCK) {
    const allGuests = mockDb.guests.list();
    const confirmations = mockDb.confirmations.list();
    const confirmedIds = new Set(confirmations.map(c => c.guest_id));
    const prices = mockDb.prices.get();

    // Personas reales confirmadas: 1 (titular) + sus acompañantes confirmados
    const confirmedPeople = confirmations.reduce(
      (sum, c) => sum + 1 + (c.adult_count ?? 0) + (c.over12_count ?? 0) + (c.under12_count ?? 0) + (c.under5_count ?? 0),
      0,
    );

    // Invitados pendientes y sus personas estimadas: 1 (titular) + todos sus locked companions
    const pendingGuests = allGuests.filter(g => !confirmedIds.has(g.id));
    const pendingPeople = pendingGuests.reduce(
      (sum, g) => sum + 1 + (g.locked_companions?.length ?? 0),
      0,
    );

    // Recaudación real (confirmados)
    const confirmedRevenue = confirmations.reduce((sum, c) => sum + (c.total_cost ?? 0), 0);
    const paidRevenue      = confirmations.filter(c => c.paid).reduce((sum, c) => sum + (c.total_cost ?? 0), 0);
    const unpaidRevenue    = confirmedRevenue - paidRevenue;

    // Recaudación estimada pendientes: costo titular + locked companions + máx. acomp. adicionales
    const pendingRevenue = pendingGuests.reduce((sum, g) => {
      const mainCost = g.main_cost ?? 0;
      const lockedCost = (g.locked_companions ?? []).reduce((s, lc) => s + (lc.cost ?? 0), 0);
      const openCost =
        (g.max_adults  ?? 0) * (g.adult_cost   ?? 0) +
        (g.max_over12  ?? 0) * (g.over12_cost  ?? 0) +
        (g.max_under12 ?? 0) * (g.under12_cost ?? 0);
      return sum + mainCost + lockedCost + openCost;
    }, 0);

    // Lo que absorben los novios: gap entre precio estándar y precio cobrado
    const coupleCovers = allGuests.reduce(
      (sum, g) => sum + calcCoupleCover(g.main_cost ?? 0, g.locked_companions ?? [], prices),
      0,
    );
    const coupleCoverCount = allGuests.reduce(
      (sum, g) => sum + ((g.main_cost ?? 0) > 0 ? 0 : 1) + (g.locked_companions ?? []).filter(lc => lc.cost === 0 && lc.type !== "under5").length,
      0,
    );

    // Recaudación pendiente separada: fija (titular + lista cerrada) vs. variable (acomp. adicionales)
    const pendingFixedRevenue = pendingGuests.reduce((sum, g) => {
      const mainCost = g.main_cost ?? 0;
      const lockedCost = (g.locked_companions ?? []).reduce((s, lc) => s + (lc.cost ?? 0), 0);
      return sum + mainCost + lockedCost;
    }, 0);
    const pendingOpenRevenue = pendingRevenue - pendingFixedRevenue;

    // Desglose por categoría — confirmados
    // titular siempre cuenta como adulto
    const confirmedAdults  = confirmations.reduce((s, c) => s + 1 + (c.adult_count  ?? 0), 0);
    const confirmedOver12  = confirmations.reduce((s, c) => s + (c.over12_count  ?? 0), 0);
    const confirmedUnder12 = confirmations.reduce((s, c) => s + (c.under12_count ?? 0), 0);
    const confirmedUnder5  = confirmations.reduce((s, c) => s + (c.under5_count  ?? 0), 0);

    // Desglose por categoría — pendientes (estimado con lista cerrada)
    const pendingAdults  = pendingGuests.reduce((s, g) =>
      s + 1 + (g.locked_companions ?? []).filter(lc => lc.type === "adult").length, 0);
    const pendingOver12  = pendingGuests.reduce((s, g) =>
      s + (g.locked_companions ?? []).filter(lc => lc.type === "over12").length, 0);
    const pendingUnder12 = pendingGuests.reduce((s, g) =>
      s + (g.locked_companions ?? []).filter(lc => lc.type === "under12").length, 0);
    const pendingUnder5  = pendingGuests.reduce((s, g) =>
      s + (g.locked_companions ?? []).filter(lc => lc.type === "under5").length, 0);

    // Lista completa: titular + todos los acompañantes de lista cerrada (excepto menores de 5)
    const guestPricing: { name: string; main_cost: number; type: "adult" | "over12" | "under12" }[] = [];
    for (const g of allGuests) {
      guestPricing.push({ name: g.full_name, main_cost: g.main_cost ?? 0, type: "adult" });
      for (const lc of g.locked_companions ?? []) {
        if (lc.type === "adult" || lc.type === "over12" || lc.type === "under12") {
          guestPricing.push({ name: lc.name, main_cost: lc.cost ?? 0, type: lc.type });
        }
      }
    }
    guestPricing.sort((a, b) => a.name.localeCompare(b.name, "es"));

    return {
      totalGuests:     allGuests.length,
      confirmedGuests: confirmations.length,
      pendingGuests:   pendingGuests.length,
      confirmedPeople,
      pendingPeople,
      totalPeople:     confirmedPeople + pendingPeople,
      confirmedRevenue,
      paidRevenue,
      unpaidRevenue,
      pendingRevenue,
      totalRevenue:    confirmedRevenue + pendingFixedRevenue,
      coupleCovers,
      coupleCoverCount,
      confirmedAdults,  confirmedOver12,  confirmedUnder12,  confirmedUnder5,
      pendingAdults,    pendingOver12,    pendingUnder12,    pendingUnder5,
      totalAdults:  confirmedAdults  + pendingAdults,
      totalOver12:  confirmedOver12  + pendingOver12,
      totalUnder12: confirmedUnder12 + pendingUnder12,
      totalUnder5:  confirmedUnder5  + pendingUnder5,
      adultStdPrice:   prices.adult_cost,
      over12StdPrice:  prices.over12_cost,
      under12StdPrice: prices.under12_cost,
      guestPricing,
      pendingFixedRevenue,
      pendingOpenRevenue,
    };
  }

  const [guestsResult, confirmationsResult, pricesResult] = await Promise.all([
    supabase.from("guests").select("id, full_name, locked_companions, max_adults, adult_cost, max_over12, over12_cost, max_under12, under12_cost, main_cost"),
    supabase.from("confirmations").select("guest_id, adult_count, over12_count, under12_count, under5_count, total_cost, paid"),
    supabase.from("settings").select("key, value").in("key", ["adult_cost", "over12_cost", "under12_cost"]),
  ]);

  const allGuests = (guestsResult.data ?? []) as {
    id: string;
    full_name: string;
    locked_companions: { name: string; type: string; cost: number }[];
    max_adults: number; adult_cost: number;
    max_over12: number; over12_cost: number;
    max_under12: number; under12_cost: number;
    main_cost: number;
  }[];
  const confirmations = confirmationsResult.data ?? [];
  const confirmedIds = new Set(confirmations.map((c: { guest_id: string }) => c.guest_id));

  const pricesMap = Object.fromEntries(
    (pricesResult.data ?? []).map((r: { key: string; value: string }) => [r.key, parseFloat(r.value) || 0])
  );
  const prices = {
    adult_cost:   pricesMap.adult_cost   ?? 0,
    over12_cost:  pricesMap.over12_cost  ?? 0,
    under12_cost: pricesMap.under12_cost ?? 0,
  };

  const confirmedPeople = confirmations.reduce(
    (sum: number, c: { adult_count: number; over12_count: number; under12_count: number; under5_count: number }) =>
      sum + 1 + (c.adult_count ?? 0) + (c.over12_count ?? 0) + (c.under12_count ?? 0) + (c.under5_count ?? 0),
    0,
  );

  const pendingGuests = allGuests.filter(g => !confirmedIds.has(g.id));
  const pendingPeople = pendingGuests.reduce(
    (sum, g) => sum + 1 + (g.locked_companions?.length ?? 0), 0,
  );

  const confirmedRevenue = confirmations.reduce(
    (sum: number, c: { total_cost: number }) => sum + (c.total_cost ?? 0), 0,
  );
  const paidRevenue = confirmations
    .filter((c: { paid: boolean }) => c.paid)
    .reduce((sum: number, c: { total_cost: number }) => sum + (c.total_cost ?? 0), 0);
  const unpaidRevenue = confirmedRevenue - paidRevenue;
  const pendingRevenue = pendingGuests.reduce((sum, g) => {
    const mainCost = g.main_cost ?? 0;
    const lockedCost = (g.locked_companions ?? []).reduce((s, lc) => s + (lc.cost ?? 0), 0);
    const openCost =
      (g.max_adults  ?? 0) * (g.adult_cost   ?? 0) +
      (g.max_over12  ?? 0) * (g.over12_cost  ?? 0) +
      (g.max_under12 ?? 0) * (g.under12_cost ?? 0);
    return sum + mainCost + lockedCost + openCost;
  }, 0);

  const coupleCovers = allGuests.reduce(
    (sum, g) => sum + calcCoupleCover(g.main_cost ?? 0, g.locked_companions ?? [], prices),
    0,
  );
  const coupleCoverCount = allGuests.reduce(
    (sum, g) => sum + ((g.main_cost ?? 0) > 0 ? 0 : 1) + (g.locked_companions ?? []).filter(lc => lc.cost === 0 && lc.type !== "under5").length,
    0,
  );

  type ConfRow = { adult_count: number; over12_count: number; under12_count: number; under5_count: number };
  const confirmedAdults  = confirmations.reduce((s: number, c: ConfRow) => s + 1 + (c.adult_count  ?? 0), 0);
  const confirmedOver12  = confirmations.reduce((s: number, c: ConfRow) => s + (c.over12_count  ?? 0), 0);
  const confirmedUnder12 = confirmations.reduce((s: number, c: ConfRow) => s + (c.under12_count ?? 0), 0);
  const confirmedUnder5  = confirmations.reduce((s: number, c: ConfRow) => s + (c.under5_count  ?? 0), 0);

  const pendingAdults  = pendingGuests.reduce((s, g) =>
    s + 1 + (g.locked_companions ?? []).filter(lc => lc.type === "adult").length, 0);
  const pendingOver12  = pendingGuests.reduce((s, g) =>
    s + (g.locked_companions ?? []).filter(lc => lc.type === "over12").length, 0);
  const pendingUnder12 = pendingGuests.reduce((s, g) =>
    s + (g.locked_companions ?? []).filter(lc => lc.type === "under12").length, 0);
  const pendingUnder5  = pendingGuests.reduce((s, g) =>
    s + (g.locked_companions ?? []).filter(lc => lc.type === "under5").length, 0);

  // Recaudación pendiente: fija vs. variable
  const pendingFixedRevenue = pendingGuests.reduce((sum, g) => {
    const mainCost = g.main_cost ?? 0;
    const lockedCost = (g.locked_companions ?? []).reduce((s, lc) => s + (lc.cost ?? 0), 0);
    return sum + mainCost + lockedCost;
  }, 0);
  const pendingOpenRevenue = pendingRevenue - pendingFixedRevenue;

  // Lista completa: titular + todos los acompañantes de lista cerrada (excepto menores de 5)
  const guestPricing: { name: string; main_cost: number; type: "adult" | "over12" | "under12" }[] = [];
  for (const g of allGuests) {
    guestPricing.push({ name: g.full_name, main_cost: g.main_cost ?? 0, type: "adult" });
    for (const lc of g.locked_companions ?? []) {
      if (lc.type === "adult" || lc.type === "over12" || lc.type === "under12") {
        guestPricing.push({ name: lc.name, main_cost: lc.cost ?? 0, type: lc.type as "adult" | "over12" | "under12" });
      }
    }
  }
  guestPricing.sort((a, b) => a.name.localeCompare(b.name, "es"));

  return {
    totalGuests:     allGuests.length,
    confirmedGuests: confirmations.length,
    pendingGuests:   pendingGuests.length,
    confirmedPeople,
    pendingPeople,
    totalPeople:     confirmedPeople + pendingPeople,
    confirmedRevenue,
    paidRevenue,
    unpaidRevenue,
    pendingRevenue,
    totalRevenue:    confirmedRevenue + pendingRevenue,
    coupleCovers,
    coupleCoverCount,
    confirmedAdults,  confirmedOver12,  confirmedUnder12,  confirmedUnder5,
    pendingAdults,    pendingOver12,    pendingUnder12,    pendingUnder5,
    totalAdults:  confirmedAdults  + pendingAdults,
    totalOver12:  confirmedOver12  + pendingOver12,
    totalUnder12: confirmedUnder12 + pendingUnder12,
    totalUnder5:  confirmedUnder5  + pendingUnder5,
    adultStdPrice:   prices.adult_cost,
    over12StdPrice:  prices.over12_cost,
    under12StdPrice: prices.under12_cost,
    guestPricing,
    pendingFixedRevenue,
    pendingOpenRevenue,
  };
}
