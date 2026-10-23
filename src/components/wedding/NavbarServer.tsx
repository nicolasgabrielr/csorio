import { getSettings } from "@/lib/settings";
import Navbar from "./Navbar";

export default async function NavbarServer() {
  const settings = await getSettings();
  return <Navbar brideName={settings.bride_name} groomName={settings.groom_name} />;
}
