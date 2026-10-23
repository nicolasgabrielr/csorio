import { createAdminClient } from "./supabase";

export type EventItem = {
  title: string;
  venue: string;
  address: string;
  date: string;
  time: string;
  maps_url: string;
  icon: "church" | "civil" | "party";
};

export type Accommodation = {
  nombre: string;
  descripcion: string;
  url: string;
};

export type TransportOption = {
  emoji: string;
  title: string;
  description: string;
};

export type AppSettings = {
  bride_name: string;
  groom_name: string;
  wedding_date: string;
  venue_name: string;
  venue_address: string;
  venue_maps_url: string;
  venue_maps_embed: string;
  cbu_ars: string;
  alias_ars: string;
  holder_ars: string;
  cbu_usd: string;
  alias_usd: string;
  holder_usd: string;
  accommodations: string; // JSON string: Accommodation[]
  main_photo: string;     // URL o path de la foto principal del hero
  gallery_photos: string; // JSON string: {src: string, alt: string}[]
  cost_salon: string;
  cost_deco: string;
  cost_dj: string;
  cost_cotillon: string;
  cost_catering: string;
  cost_foto_video: string;
  cost_traje: string;
  cost_vestido: string;
  companion_suggestions: string; // "true" | "false"
  transport_options: string;     // JSON string: TransportOption[]
  gifts_title: string;
  gifts_body: string;
  gifts_footer: string;
  events: string; // JSON string: EventItem[]
  gallery_title: string;
  gallery_subtitle: string;
  rsvp_text: string;
  rsvp_deadline: string; // YYYY-MM-DD, vacío = usa wedding_date
  photos_require_approval: string; // "true" | "false"
};

export function getEnvDefaults(): AppSettings {
  return {
    bride_name: process.env.NEXT_PUBLIC_BRIDE_NAME ?? "",
    groom_name: process.env.NEXT_PUBLIC_GROOM_NAME ?? "",
    wedding_date: process.env.NEXT_PUBLIC_WEDDING_DATE ?? "",
    venue_name: process.env.NEXT_PUBLIC_VENUE_NAME ?? "",
    venue_address: process.env.NEXT_PUBLIC_VENUE_ADDRESS ?? "",
    venue_maps_url: process.env.NEXT_PUBLIC_VENUE_MAPS_URL ?? "",
    venue_maps_embed: process.env.NEXT_PUBLIC_VENUE_MAPS_EMBED ?? "",
    cbu_ars: process.env.NEXT_PUBLIC_CBU ?? "",
    alias_ars: process.env.NEXT_PUBLIC_ALIAS ?? "",
    holder_ars: process.env.NEXT_PUBLIC_BANK_HOLDER ?? "",
    cbu_usd: process.env.NEXT_PUBLIC_CBU_USD ?? "",
    alias_usd: process.env.NEXT_PUBLIC_ALIAS_USD ?? "",
    holder_usd: process.env.NEXT_PUBLIC_BANK_HOLDER_USD ?? "",
    accommodations: "[]",
    main_photo: "",
    gallery_photos: "[]",
    cost_salon: "0",
    cost_deco: "0",
    cost_dj: "0",
    cost_cotillon: "0",
    cost_catering: "0",
    cost_foto_video: "0",
    cost_traje: "0",
    cost_vestido: "0",
    companion_suggestions: "true",
    gifts_title: "Tu presencia es el mejor regalo",
    gifts_body: "Pero si querés hacernos un regalo, podés hacerlo a través de una transferencia. Cada contribución nos ayuda a comenzar esta nueva etapa juntos.",
    gifts_footer: "Gracias por hacernos parte de tu vida. ❤️",
    events: JSON.stringify([
      { title: "Ceremonia", venue: "Parroquia Nuestra Señora del Rosario", address: "Bergplace 1387, Buenos Aires", date: "8 de octubre", time: "12:00 hs", maps_url: "", icon: "church" },
      { title: "Civil", venue: "Registro Civil N° 17", address: "Av. Córdoba 1235, Buenos Aires", date: "8 de octubre", time: "10:00 hs", maps_url: "", icon: "civil" },
      { title: "Festejo", venue: "El Castillo", address: "Av. Figueroa Alcorta 3979, Buenos Aires", date: "8 de octubre", time: "20:00 hs", maps_url: "", icon: "party" },
    ] as EventItem[]),
    gallery_title: "Momentos únicos",
    gallery_subtitle: "Álbum de Fotos",
    rsvp_text: "Esperamos contar con tu presencia",
    rsvp_deadline: "",
    photos_require_approval: "false",
    transport_options: JSON.stringify([
      { emoji: "🚗", title: "En auto", description: "Hay estacionamiento disponible en el lugar" },
      { emoji: "✈️", title: "Aeropuerto", description: "A 30 mins del Aeropuerto de San Luis (LUQ)" },
      { emoji: "🚕", title: "Taxi / remis", description: "Podés usar Uber, Cabify o remis local" },
    ]),
  };
}

const USE_MOCK = !process.env.NEXT_PUBLIC_SUPABASE_URL;

export async function getSettings(): Promise<AppSettings> {
  const defaults = getEnvDefaults();

  if (USE_MOCK) {
    const mockOverrides = globalThis.__mockSettings ?? {};
    return { ...defaults, ...mockOverrides };
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("settings")
      .select("key, value");

    if (error || !data) return defaults;

    const overrides: Partial<AppSettings> = {};
    for (const row of data as { key: string; value: string }[]) {
      if (row.key in defaults) {
        (overrides as Record<string, string>)[row.key] = row.value;
      }
    }

    return { ...defaults, ...overrides };
  } catch {
    return defaults;
  }
}
