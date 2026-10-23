import { getSettings } from "@/lib/settings";
import FotosForm from "./FotosForm";

export const dynamic = "force-dynamic";

export default async function FotosPage() {
  const settings = await getSettings();

  let galleryPhotos: { src: string; alt: string }[] = [];
  try {
    galleryPhotos = JSON.parse(settings.gallery_photos || "[]");
  } catch {
    galleryPhotos = [];
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-wedding-dark">Fotos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestioná la foto principal del hero y las fotos de la galería.
        </p>
      </div>
      <FotosForm
        initialMainPhoto={settings.main_photo}
        initialGallery={galleryPhotos}
      />
    </div>
  );
}
