import NavbarServer from "@/components/wedding/NavbarServer";
import GuestSearch from "@/components/wedding/GuestSearch";
import { getSettings } from "@/lib/settings";

export default async function ConfirmarPage() {
  const settings = await getSettings();

  return (
    <>
      {/* Header con foto de fondo */}
      <section
        className="relative py-32 px-6 bg-cover bg-center"
        style={{ backgroundImage: "url('/photos/foto1.jpg')" }}
      >
        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-black/55 pointer-events-none" />

        <NavbarServer />

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <p className="text-wedding-gold text-sm uppercase tracking-[0.3em] mb-3">
            Paso importante
          </p>
          <h1 className="font-display text-4xl sm:text-5xl text-white">
            Confirmar asistencia
          </h1>
          <p className="text-white/70 mt-4 text-base">
            Buscá tu nombre para confirmar que vas a estar en este día tan especial.
          </p>
        </div>
      </section>

      {/* Formulario */}
      <section className="bg-wedding-cream min-h-[50vh] py-16 px-6">
        <div className="max-w-lg mx-auto">
          <GuestSearch brideName={settings.bride_name} groomName={settings.groom_name} />
        </div>
      </section>
    </>
  );
}
