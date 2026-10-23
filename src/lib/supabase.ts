import { createClient } from "@supabase/supabase-js";

const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const rawSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

const supabaseUrl = rawSupabaseUrl || "https://placeholder.supabase.co";
const supabaseAnonKey = rawSupabaseAnonKey || "placeholder-anon-key";

export function isSupabaseConfigured(): boolean {
  return Boolean(rawSupabaseUrl && !rawSupabaseUrl.includes("placeholder.supabase.co"));
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || rawSupabaseAnonKey || "placeholder-service-key";
  return createClient(supabaseUrl, serviceRoleKey);
}

export type CompanionType = "adult" | "over12" | "under12" | "under5";

export type LockedCompanion = {
  name: string;
  type: CompanionType;
  cost: number;
};

export type PhraseType = "family" | "friends" | "custom";

export type Guest = {
  id: string;
  full_name: string;
  allows_companion: boolean;
  main_cost?: number;
  // Lista cerrada (pre-definida por el admin)
  locked_companions: LockedCompanion[];
  // Acompañantes adicionales (libres, controlados por el invitado)
  max_adults: number;
  adult_cost: number;
  max_over12: number;    // mayores de 12
  over12_cost: number;
  max_under12: number;   // menores de 12
  under12_cost: number;
  phrase_type: PhraseType;
  custom_phrase: string;
  created_at: string;
};

export type Companion = {
  name: string;
  type: CompanionType;
  menu?: string;
};

export type Confirmation = {
  id: string;
  guest_id: string;
  dni: string;
  adult_count: number;
  over12_count: number;
  under12_count: number;
  under5_count: number;
  companions: Companion[];
  main_menu?: string;
  total_cost: number;
  paid: boolean;
  confirmed_at: string;
  guests?: Guest;
};
