import NavbarServer from "@/components/wedding/NavbarServer";
import { getSettings } from "@/lib/settings";
import type { Accommodation, TransportOption } from "@/lib/settings";

export default async function LugarPage() {
  const settings = await getSettings();
  const { venue_name, venue_address, venue_maps_url, venue_maps_embed, accommodations, transport_options } = settings;

  let alojamientos: Accommodation[] = [];
  try {
    alojamientos = JSON.parse(accommodations || "[]");
  } catch {
    alojamientos = [];
  }

  let transportOpts: TransportOption[] = [];
  try {
    transportOpts = JSON.parse(transport_options || "[]");
  } catch {
    transportOpts = [];
  }

  return (
    <>
      <section
        className="relative py-32 px-6"
        style={{
          background: "linear-gradient(135deg, #1A1A1A 0%, #2C2518 100%)",
        }}
      >
        <NavbarServer />
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-wedding-gold text-sm uppercase tracking-[0.3em] mb-3">
            El evento
          </p>
          <h1 className="font-display text-4xl sm:text-5xl text-white">El lugar</h1>
        </div>
      </section>

      <section className="bg-wedding-cream py-16 px-6">
        <div className="max-w-3xl mx-auto space-y-12">

          {/* Info del venue */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-wedding-gold/10 text-2xl mb-2">
              📍
            </div>
            <h2 className="font-display text-3xl text-wedding-dark">{venue_name || "Salón de fiestas"}</h2>
            <p className="text-muted-foreground text-lg">{venue_address || "Dirección a confirmar"}</p>
            {venue_maps_url && (
              <a
                href={venue_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-wedding-gold text-white font-medium tracking-wide hover:bg-wedding-gold/90 transition-colors rounded-sm"
              >
                Cómo llegar →
              </a>
            )}
          </div>

          {/* Mapa embed */}
          {venue_maps_embed ? (
            <div className="rounded-xl overflow-hidden shadow-lg border border-wedding-gold/20 aspect-video">
              <iframe
                src={venue_maps_embed}
                className="w-full h-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-wedding-gold/30 aspect-video flex items-center justify-center bg-white/50">
              <div className="text-center text-muted-foreground">
                <p className="text-4xl mb-2">🗺️</p>
                <p className="text-sm">
                  Configurá el mapa desde el panel admin en <strong>Configuración</strong>
                </p>
              </div>
            </div>
          )}

          {/* Cómo llegar */}
          {transportOpts.length > 0 && (
            <div className={`grid grid-cols-1 gap-4 ${transportOpts.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
              {transportOpts.map((t, i) => (
                <div key={i} className="bg-white rounded-xl p-5 text-center border border-wedding-gold/20">
                  <p className="text-2xl mb-2">{t.emoji}</p>
                  <h3 className="font-semibold text-wedding-dark mb-1">{t.title}</h3>
                  <p className="text-sm text-muted-foreground">{t.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Alojamientos recomendados */}
          {alojamientos.length > 0 && (
            <div className="space-y-5">
              <div className="text-center">
                <h2 className="font-display text-2xl text-wedding-dark">Dónde quedarse</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Algunas opciones cerca del lugar para que la noche no termine
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {alojamientos.map((a, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl p-5 border border-wedding-gold/20 flex flex-col gap-2"
                  >
                    <p className="text-xl">🏨</p>
                    <h3 className="font-semibold text-wedding-dark text-sm leading-tight">{a.nombre}</h3>
                    <p className="text-xs text-muted-foreground flex-1">{a.descripcion}</p>
                    {a.url && (
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-wedding-gold hover:underline mt-1"
                      >
                        Ver más →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>
    </>
  );
}
