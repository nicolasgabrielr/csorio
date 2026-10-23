import { readdirSync } from "fs";
import { join } from "path";
import GaleriaClient from "./GaleriaClient";
import { getSettings } from "@/lib/settings";

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

function getPhotosFromFilesystem(): { src: string; alt: string }[] {
  try {
    const photosDir = join(process.cwd(), "public", "photos");
    const files = readdirSync(photosDir);
    return files
      .filter(f => IMAGE_EXTENSIONS.some(ext => f.toLowerCase().endsWith(ext)))
      .map((f, i) => ({ src: `/photos/${f}`, alt: `Foto ${i + 1}` }));
  } catch {
    return [];
  }
}

export default async function GaleriaPage() {
  const settings = await getSettings();

  let photos: { src: string; alt: string }[] = [];
  try {
    const parsed = JSON.parse(settings.gallery_photos || "[]");
    if (Array.isArray(parsed) && parsed.length > 0) {
      photos = parsed;
    }
  } catch {
    // ignore
  }

  // Fallback al filesystem si no hay fotos en settings
  if (photos.length === 0) {
    photos = getPhotosFromFilesystem();
  }

  return (
    <GaleriaClient
      photos={photos}
      brideName={settings.bride_name}
      groomName={settings.groom_name}
    />
  );
}
