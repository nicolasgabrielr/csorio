import { getGuestPhotos } from "@/actions/guest-photos";
import { getSettings } from "@/lib/settings";
import SlideshowClient from "./SlideshowClient";

export const dynamic = "force-dynamic";

export default async function SlideshowPage() {
  const [photos, settings] = await Promise.all([
    getGuestPhotos("approved"),
    getSettings(),
  ]);

  return (
    <SlideshowClient
      initialPhotos={photos}
      brideName={settings.bride_name}
      groomName={settings.groom_name}
    />
  );
}
