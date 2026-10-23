"use server";

import { mockDb } from "@/lib/mock-db";
import type { Prices } from "@/lib/mock-db";
import { getSettings } from "@/lib/settings";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export type FixedCosts = {
  salon: number;
  deco: number;
  dj: number;
  cotillon: number;
  catering: number;
  foto_video: number;
  traje: number;
  vestido: number;
};

// ─── Precios por acompañante ──────────────────────────────────────────────────

export async function getPrices(): Promise<Prices> {
  if (!isSupabaseConfigured()) return mockDb.prices.get();

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("settings")
      .select("key, value")
      .in("key", ["adult_cost", "over12_cost", "under12_cost"]);

    const map = Object.fromEntries(
      (data ?? []).map((r: { key: string; value: string }) => [r.key, parseFloat(r.value) || 0]),
    );
    return {
      adult_cost:   map.adult_cost   ?? 0,
      over12_cost:  map.over12_cost  ?? 0,
      under12_cost: map.under12_cost ?? 0,
    };
  } catch {
    return { adult_cost: 0, over12_cost: 0, under12_cost: 0 };
  }
}

export async function updatePrices(data: Prices): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    mockDb.prices.update(data);
    revalidatePath("/admin/precios");
    revalidatePath("/admin/invitados");
    return { success: true };
  }

  try {
    const admin = createAdminClient();
    const rows = Object.entries(data).map(([key, value]) => ({
      key,
      value: String(value),
      updated_at: new Date().toISOString(),
    }));
    const { error } = await admin.from("settings").upsert(rows, { onConflict: "key" });
    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/precios");
    revalidatePath("/admin/invitados");
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

// ─── Costos fijos del evento ──────────────────────────────────────────────────

export async function getFixedCosts(): Promise<FixedCosts> {
  const settings = await getSettings();
  return {
    salon:      parseFloat(settings.cost_salon)      || 0,
    deco:       parseFloat(settings.cost_deco)       || 0,
    dj:         parseFloat(settings.cost_dj)         || 0,
    cotillon:   parseFloat(settings.cost_cotillon)   || 0,
    catering:   parseFloat(settings.cost_catering)   || 0,
    foto_video: parseFloat(settings.cost_foto_video) || 0,
    traje:      parseFloat(settings.cost_traje)      || 0,
    vestido:    parseFloat(settings.cost_vestido)    || 0,
  };
}

export async function updateFixedCosts(data: FixedCosts): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    if (!globalThis.__mockSettings) globalThis.__mockSettings = {};
    globalThis.__mockSettings.cost_salon      = String(data.salon);
    globalThis.__mockSettings.cost_deco       = String(data.deco);
    globalThis.__mockSettings.cost_dj         = String(data.dj);
    globalThis.__mockSettings.cost_cotillon   = String(data.cotillon);
    globalThis.__mockSettings.cost_catering   = String(data.catering);
    globalThis.__mockSettings.cost_foto_video = String(data.foto_video);
    globalThis.__mockSettings.cost_traje      = String(data.traje);
    globalThis.__mockSettings.cost_vestido    = String(data.vestido);
    revalidatePath("/admin/precios");
    revalidatePath("/admin/metricas");
    return { success: true };
  }

  try {
    const admin = createAdminClient();
    const rows = [
      { key: "cost_salon",      value: String(data.salon),      updated_at: new Date().toISOString() },
      { key: "cost_deco",       value: String(data.deco),       updated_at: new Date().toISOString() },
      { key: "cost_dj",         value: String(data.dj),         updated_at: new Date().toISOString() },
      { key: "cost_cotillon",   value: String(data.cotillon),   updated_at: new Date().toISOString() },
      { key: "cost_catering",   value: String(data.catering),   updated_at: new Date().toISOString() },
      { key: "cost_foto_video", value: String(data.foto_video), updated_at: new Date().toISOString() },
      { key: "cost_traje",      value: String(data.traje),      updated_at: new Date().toISOString() },
      { key: "cost_vestido",    value: String(data.vestido),    updated_at: new Date().toISOString() },
    ];
    const { error } = await admin.from("settings").upsert(rows, { onConflict: "key" });
    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/precios");
    revalidatePath("/admin/metricas");
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}
