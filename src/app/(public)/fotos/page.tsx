import { getSettings } from "@/lib/settings";
import FotosUploadClient from "./FotosUploadClient";

export const dynamic = "force-dynamic";

export default async function FotosPage() {
  const settings = await getSettings();
  return (
    <FotosUploadClient
      brideName={settings.bride_name}
      groomName={settings.groom_name}
      requireApproval={settings.photos_require_approval === "true"}
    />
  );
}
