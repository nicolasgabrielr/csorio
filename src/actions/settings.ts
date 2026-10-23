"use server";

import { revalidatePath } from "next/cache";
import { getSettings as _getSettings, type AppSettings } from "@/lib/settings";
import { createAdminClient } from "@/lib/supabase";

export { _getSettings as getSettings };

const USE_MOCK = !process.env.NEXT_PUBLIC_SUPABASE_URL;

export async function updateSettings(data: Partial<AppSettings>): Promise<{ success: boolean; error?: string }> {
  if (USE_MOCK) {
    if (!globalThis.__mockSettings) {
      globalThis.__mockSettings = {};
    }
    for (const [key, value] of Object.entries(data)) {
      globalThis.__mockSettings[key] = value as string;
    }
    revalidatePaths();
    return { success: true };
  }

  try {
    const admin = createAdminClient();
    const rows = Object.entries(data).map(([key, value]) => ({
      key,
      value: value as string,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await admin
      .from("settings")
      .upsert(rows, { onConflict: "key" });

    if (error) return { success: false, error: error.message };

    revalidatePaths();
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

function revalidatePaths() {
  revalidatePath("/");
  revalidatePath("/lugar");
  revalidatePath("/regalos");
  revalidatePath("/galeria");
  revalidatePath("/admin/configuracion");
  revalidatePath("/admin/fotos");
  revalidatePath("/admin/fotos-invitados");
  revalidatePath("/fotos");
  revalidatePath("/fotos/slideshow");
}
