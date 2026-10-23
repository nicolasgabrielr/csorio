"use server";

import { createAdminClient, supabase } from "@/lib/supabase";
import { mockDb } from "@/lib/mock-db";
import type { Guest, LockedCompanion } from "@/lib/supabase";
import { getSettings, isMockMode } from "@/lib/settings";
import { revalidatePath } from "next/cache";

export type CompanionSuggestion = {
  companionName: string;
  guestName: string;
  guestId: string;
};

function norm(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

// Coincidencia fuzzy: cada palabra del search debe matchear al menos una palabra del target
// (prefijo en cualquier dirección, para apodos como "Maca" → "Macarena")
function fuzzyMatch(search: string, target: string): boolean {
  const sWords = norm(search).split(/\s+/).filter(w => w.length >= 3);
  const tWords = norm(target).split(/\s+/).filter(w => w.length >= 2);

  if (sWords.length === 0) return false;

  return sWords.every(sw => tWords.some(tw => tw.startsWith(sw) || sw.startsWith(tw)));
}

function findCompanionSuggestions(
  search: string,
  allGuests: Guest[],
): CompanionSuggestion[] {
  const results: CompanionSuggestion[] = [];
  for (const g of allGuests) {
    for (const lc of g.locked_companions ?? []) {
      if (fuzzyMatch(search, lc.name)) {
        results.push({ companionName: lc.name, guestName: g.full_name, guestId: g.id });
        if (results.length >= 3) return results; // máximo 3 sugerencias
      }
    }
  }
  return results;
}

export async function searchGuest(name: string): Promise<{
  guest: Guest | null;
  alreadyConfirmed: boolean;
  error?: string;
  suggestions?: CompanionSuggestion[];
  ambiguous?: boolean;
  suggestionsEnabled: boolean;
  candidates?: Guest[]; // múltiples matches sin apellido confirmado
}> {
  if (!name || name.trim().length < 2) {
    return { guest: null, alreadyConfirmed: false, error: "Escribí al menos 2 caracteres", suggestionsEnabled: true };
  }

  const settings = await getSettings();
  const suggestionsEnabled = settings.companion_suggestions !== "false";
  const useMock = settings.use_mock_guests === "true" || !(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL);

  if (useMock) {
    const allGuests = mockDb.guests.list();
    const normFn = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    const matches = mockDb.guests.searchAll(name.trim());

    if (matches.length === 0) {
      const suggestions = suggestionsEnabled ? findCompanionSuggestions(name.trim(), allGuests) : [];
      return { guest: null, alreadyConfirmed: false, suggestions, suggestionsEnabled };
    }

    // Buscar match exacto por apellido
    const exactMatch = matches.find(g => {
      const lastName = g.full_name.trim().split(/\s+/).at(-1) ?? "";
      return normFn(name).includes(normFn(lastName));
    });

    if (!exactMatch) {
      const suggestions = suggestionsEnabled ? findCompanionSuggestions(name.trim(), allGuests) : [];
      return { guest: null, alreadyConfirmed: false, candidates: matches, suggestions, suggestionsEnabled };
    }

    const alreadyConfirmed = !!mockDb.confirmations.findByGuestId(exactMatch.id);
    return { guest: exactMatch, alreadyConfirmed, suggestionsEnabled };
  }

  const normalized = name.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const [{ data: guests, error }, { data: allGuests }] = await Promise.all([
    supabase.from("guests").select("*").ilike("full_name", `%${normalized}%`).limit(10),
    suggestionsEnabled
      ? supabase.from("guests").select("id, full_name, locked_companions")
      : Promise.resolve({ data: [] }),
  ]);

  if (error) return { guest: null, alreadyConfirmed: false, error: "Error al buscar", suggestionsEnabled };

  const suggestions = suggestionsEnabled
    ? findCompanionSuggestions(name.trim(), (allGuests ?? []) as Guest[])
    : [];

  if (!guests || guests.length === 0) {
    return { guest: null, alreadyConfirmed: false, suggestions, suggestionsEnabled };
  }

  const allMatches = guests as Guest[];

  // Buscar match exacto por apellido
  const normSearch = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const exactMatch = allMatches.find(g => {
    const lastName = g.full_name.trim().split(/\s+/).at(-1) ?? "";
    return normSearch(name).includes(normSearch(lastName));
  });

  if (!exactMatch) {
    // Ninguno tiene el apellido en el search → mostrar todos como candidatos
    const companionSuggestions = suggestionsEnabled ? suggestions : [];
    return { guest: null, alreadyConfirmed: false, candidates: allMatches, suggestions: companionSuggestions, suggestionsEnabled };
  }

  const { data: confirmations } = await supabase
    .from("confirmations").select("id").eq("guest_id", exactMatch.id).limit(1);

  const alreadyConfirmed = !!(confirmations && confirmations.length > 0);
  return { guest: exactMatch, alreadyConfirmed, suggestionsEnabled };
}

export async function getGuestForConfirmation(id: string): Promise<{
  guest: Guest | null;
  alreadyConfirmed: boolean;
}> {
  if (await isMockMode()) {
    const guest = mockDb.guests.list().find(g => g.id === id) ?? null;
    if (!guest) return { guest: null, alreadyConfirmed: false };
    const alreadyConfirmed = !!mockDb.confirmations.findByGuestId(id);
    return { guest, alreadyConfirmed };
  }

  const { data } = await supabase.from("guests").select("*").eq("id", id).limit(1);
  const guest = data?.[0] as Guest | null ?? null;
  if (!guest) return { guest: null, alreadyConfirmed: false };

  const { data: confirmations } = await supabase
    .from("confirmations").select("id").eq("guest_id", id).limit(1);
  return { guest, alreadyConfirmed: !!(confirmations && confirmations.length > 0) };
}

export async function listGuests(): Promise<Guest[]> {
  if (await isMockMode()) return mockDb.guests.list();

  const { data, error } = await supabase.from("guests").select("*").order("full_name");
  if (error) return [];
  return (data as Guest[]) ?? [];
}

type GuestData = {
  full_name: string;
  allows_companion: boolean;
  main_cost?: number;
  locked_companions: LockedCompanion[];
  max_adults: number;
  adult_cost: number;
  max_over12: number;
  over12_cost: number;
  max_under12: number;
  under12_cost: number;
  phrase_type: "family" | "friends" | "custom";
  custom_phrase: string;
};

export async function createGuest(data: GuestData): Promise<{ success: boolean; error?: string }> {
  if (await isMockMode()) {
    mockDb.guests.create(data);
    revalidatePath("/admin/invitados");
    return { success: true };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("guests").insert([data]);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/invitados");
  return { success: true };
}

export async function updateGuest(id: string, data: GuestData): Promise<{ success: boolean; error?: string }> {
  if (await isMockMode()) {
    mockDb.guests.update(id, data);
    revalidatePath("/admin/invitados");
    return { success: true };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("guests").update(data).eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/invitados");
  return { success: true };
}

export async function deleteGuest(id: string): Promise<{ success: boolean; error?: string }> {
  if (await isMockMode()) {
    mockDb.guests.delete(id);
    revalidatePath("/admin/invitados");
    revalidatePath("/admin/confirmados");
    revalidatePath("/admin/metricas");
    return { success: true };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("guests").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/invitados");
  revalidatePath("/admin/confirmados");
  revalidatePath("/admin/metricas");
  return { success: true };
}

export async function exportGuestsAsJson(): Promise<string> {
  const guests = await listGuests();
  return JSON.stringify(guests, null, 2);
}

