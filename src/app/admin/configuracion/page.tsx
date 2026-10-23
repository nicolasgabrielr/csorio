import { getSettings } from "@/lib/settings";
import { isSupabaseConfigured } from "@/lib/supabase";
import ConfiguracionForm from "./ConfiguracionForm";

export const dynamic = "force-dynamic";

export default async function ConfiguracionPage() {
  const settings = await getSettings();
  const supabaseConnected = isSupabaseConfigured();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-wedding-dark">Configuración</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Editá el contenido del sitio: nombres, fecha, lugar, datos bancarios y alojamientos.
        </p>
      </div>
      <ConfiguracionForm initialSettings={settings} supabaseConnected={supabaseConnected} />
    </div>
  );
}
