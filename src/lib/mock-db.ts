import type { Guest, Confirmation } from "./supabase";

function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Persiste entre re-evaluaciones del módulo en Next.js dev
export type Prices = {
  adult_cost: number;
  over12_cost: number;
  under12_cost: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __mockGuests: Guest[] | undefined;
  // eslint-disable-next-line no-var
  var __mockConfirmations: Confirmation[] | undefined;
  // eslint-disable-next-line no-var
  var __mockPrices: Prices | undefined;
  // eslint-disable-next-line no-var
  var __mockSettings: Record<string, string> | undefined;
  // eslint-disable-next-line no-var
  var __mockGuestsMigration: number | undefined;
  // eslint-disable-next-line no-var
  var __mockGuestPhotos: import("@/actions/guest-photos").GuestPhoto[] | undefined;
}

if (!globalThis.__mockGuests) {
  globalThis.__mockGuests = [
    {
      id: "mock-guest-1",
      full_name: "Juan Pérez",
      allows_companion: false,
      max_adults: 0,
      adult_cost: 0,
      max_over12: 0,
      over12_cost: 0,
      max_under12: 0,
      under12_cost: 0,
      locked_companions: [
        { name: "Laura Gómez", type: "adult", cost: 30000 },
        { name: "Tomás Pérez", type: "under12", cost: 20000 },
      ],
      phrase_type: "family",
      custom_phrase: "",
      created_at: "2026-05-13T00:41:07.850Z",
      main_cost: 30000,
    },
    {
      id: "mock-guest-2",
      full_name: "María Rodríguez",
      allows_companion: true,
      max_adults: 1,
      adult_cost: 100000,
      max_over12: 0,
      over12_cost: 0,
      max_under12: 0,
      under12_cost: 0,
      locked_companions: [],
      phrase_type: "friends",
      custom_phrase: "",
      created_at: "2026-05-13T00:41:07.851Z",
      main_cost: 30000,
    },
    {
      id: "mock-guest-3",
      full_name: "Carlos Fernández",
      allows_companion: false,
      max_adults: 0,
      adult_cost: 0,
      max_over12: 0,
      over12_cost: 0,
      max_under12: 0,
      under12_cost: 0,
      locked_companions: [
        { name: "Sofía López", type: "adult", cost: 30000 },
      ],
      phrase_type: "friends",
      custom_phrase: "",
      created_at: "2026-05-13T00:41:07.851Z",
      main_cost: 30000,
    },
    {
      id: "mock-guest-4",
      full_name: "Lucía Martínez",
      allows_companion: false,
      max_adults: 0,
      adult_cost: 0,
      max_over12: 0,
      over12_cost: 0,
      max_under12: 0,
      under12_cost: 0,
      locked_companions: [],
      phrase_type: "family",
      custom_phrase: "",
      created_at: "2026-05-13T00:41:07.850Z",
      main_cost: 30000,
    },
  ];
}

if (!globalThis.__mockConfirmations) {
  globalThis.__mockConfirmations = [];
}

if (!globalThis.__mockPrices) {
  globalThis.__mockPrices = { adult_cost: 100000, over12_cost: 65000, under12_cost: 40000 };
}

if (!globalThis.__mockSettings) {
  globalThis.__mockSettings = {};
}

const guests = globalThis.__mockGuests;
const confirmations = globalThis.__mockConfirmations;

function normalize(str: string) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export const mockDb = {
  guests: {
    list: () => [...guests].sort((a, b) => a.full_name.localeCompare(b.full_name)),
    search: (name: string) => guests.find(g => normalize(g.full_name).includes(normalize(name))) ?? null,
    searchAll: (name: string) => guests.filter(g => normalize(g.full_name).includes(normalize(name))),
    create: (data: Omit<Guest, "id" | "created_at">) => {
      const g: Guest = { ...data, id: uuid(), created_at: new Date().toISOString() };
      guests.push(g);
      return g;
    },
    update: (id: string, data: Partial<Guest>) => {
      const i = guests.findIndex(g => g.id === id);
      if (i === -1) return null;
      guests[i] = { ...guests[i], ...data };
      return guests[i];
    },
    delete: (id: string) => {
      const i = guests.findIndex(g => g.id === id);
      if (i !== -1) guests.splice(i, 1);
    },
  },
  confirmations: {
    list: () => confirmations.map(c => ({
      ...c,
      guests: guests.find(g => g.id === c.guest_id),
    })),
    findByGuestId: (guestId: string) => confirmations.find(c => c.guest_id === guestId) ?? null,
    create: (data: Omit<Confirmation, "id" | "confirmed_at">) => {
      const c: Confirmation = { ...data, paid: false, id: uuid(), confirmed_at: new Date().toISOString() };
      confirmations.push(c);
      return c;
    },
    update: (id: string, data: Partial<Confirmation>) => {
      const i = confirmations.findIndex(c => c.id === id);
      if (i === -1) return null;
      confirmations[i] = { ...confirmations[i], ...data };
      return confirmations[i];
    },
    delete: (id: string) => {
      const i = confirmations.findIndex(c => c.id === id);
      if (i !== -1) confirmations.splice(i, 1);
    },
    metrics: () => ({
      totalGuests: guests.length,
      confirmedGuests: confirmations.length,
      totalCompanions: confirmations.reduce((s, c) => s + c.adult_count + c.over12_count + c.under12_count, 0),
      totalRevenue: confirmations.reduce((s, c) => s + (c.total_cost ?? 0), 0),
    }),
  },
  prices: {
    get: (): Prices => ({ ...globalThis.__mockPrices! }),
    update: (data: Prices) => {
      globalThis.__mockPrices = { ...data };
      return globalThis.__mockPrices;
    },
  },
};
