import { getGuestPhotos } from "@/actions/guest-photos";
import { getSettings } from "@/lib/settings";
import FotosInvitadosClient from "./FotosInvitadosClient";

export const dynamic = "force-dynamic";

export default async function FotosInvitadosPage() {
  const [photos, settings] = await Promise.all([
    getGuestPhotos(),
    getSettings(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-wedding-dark">Fotos de invitados</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Moderá las fotos subidas durante el evento.
        </p>
      </div>
      <FotosInvitadosClient
        initialPhotos={photos}
        requireApproval={settings.photos_require_approval === "true"}
      />
    </div>
  );
}
