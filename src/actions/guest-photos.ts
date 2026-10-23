"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase";
import { getSettings } from "@/lib/settings";

export type GuestPhoto = {
  id: string;
  guest_name: string;
  description: string;
  photo_url: string;
  status: "approved" | "pending";
  created_at: string;
};

const USE_MOCK = !process.env.NEXT_PUBLIC_SUPABASE_URL;

declare global {
  // eslint-disable-next-line no-var
  var __mockGuestPhotos: GuestPhoto[] | undefined;
}

if (!globalThis.__mockGuestPhotos) {
  globalThis.__mockGuestPhotos = [];
}

function revalidatePhotoPaths() {
  revalidatePath("/fotos/slideshow");
  revalidatePath("/admin/fotos-invitados");
}

export async function createGuestPhoto(data: {
  guest_name: string;
  description: string;
  photo_url: string;
}): Promise<{ success: boolean; error?: string }> {
  const settings = await getSettings();
  const status = settings.photos_require_approval === "true" ? "pending" : "approved";

  if (USE_MOCK) {
    globalThis.__mockGuestPhotos!.push({
      id: `gp-${Date.now()}`,
      ...data,
      status,
      created_at: new Date().toISOString(),
    });
    revalidatePhotoPaths();
    return { success: true };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("guest_photos").insert({ ...data, status });
  if (error) return { success: false, error: error.message };
  revalidatePhotoPaths();
  return { success: true };
}

export async function getGuestPhotos(status?: "approved" | "pending"): Promise<GuestPhoto[]> {
  if (USE_MOCK) {
    const all = globalThis.__mockGuestPhotos ?? [];
    return status ? all.filter(p => p.status === status) : [...all];
  }

  const admin = createAdminClient();
  let query = admin
    .from("guest_photos")
    .select("*")
    .order("created_at", { ascending: true });
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error || !data) return [];
  return data as GuestPhoto[];
}

export async function updateGuestPhotoStatus(
  id: string,
  status: "approved" | "pending"
): Promise<{ success: boolean; error?: string }> {
  if (USE_MOCK) {
    const photo = globalThis.__mockGuestPhotos?.find(p => p.id === id);
    if (photo) photo.status = status;
    revalidatePhotoPaths();
    return { success: true };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("guest_photos").update({ status }).eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePhotoPaths();
  return { success: true };
}

export async function deleteGuestPhoto(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (USE_MOCK) {
    const idx = globalThis.__mockGuestPhotos?.findIndex(p => p.id === id) ?? -1;
    if (idx !== -1) globalThis.__mockGuestPhotos!.splice(idx, 1);
    revalidatePhotoPaths();
    return { success: true };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("guest_photos").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePhotoPaths();
  return { success: true };
}
