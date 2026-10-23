import Image from "next/image";
import { readdirSync } from "fs";
import { join } from "path";
import NavbarServer from "@/components/wedding/NavbarServer";
import CountdownTimer from "@/components/wedding/CountdownTimer";
import EventCards from "@/components/wedding/EventCards";
import ConfirmarModal from "@/components/wedding/ConfirmarModal";
import RegalosModal from "@/components/wedding/RegalosModal";
import { getSettings } from "@/lib/settings";
import type { EventItem } from "@/lib/settings";

function getPhotosFromFilesystem(): { src: string; alt: string }[] {
  try {
    const dir = join(process.cwd(), "public", "photos", "gallery");
    const exts = [".jpg", ".jpeg", ".png", ".webp", ".avif"];
    return readdirSync(dir)
      .filter(f => exts.some(e => f.toLowerCase().endsWith(e)))
      .map((f, i) => ({ src: `/photos/gallery/${f}`, alt: `Foto ${i + 1}` }));
  } catch { return []; }
}

export default async function HomePage() {
  const settings = await getSettings();
  const { bride_name, groom_name, wedding_date } = settings;

  let events: EventItem[] = [];
  try { events = JSON.parse(settings.events || "[]"); } catch { events = []; }

  let photos: { src: string; alt: string }[] = [];
  try {
    const parsed = JSON.parse(settings.gallery_photos || "[]");
    photos = Array.isArray(parsed) && parsed.length > 0 ? parsed : getPhotosFromFilesystem();
  } catch { photos = getPhotosFromFilesystem(); }
  photos = photos.slice(0, 8);

  const weddingDate = wedding_date || "2025-04-26";
  const dateFormatted = new Date(weddingDate + "T12:00:00").toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const galleryTitle = settings.gallery_title || "Momentos únicos";
  const gallerySubtitle = settings.gallery_subtitle || "Álbum de Fotos";
  const rsvpText = settings.rsvp_text || "Esperamos contar con tu presencia";
  const rsvpDeadlineDate = settings.rsvp_deadline || weddingDate;
  const rsvpDeadlineFormatted = new Date(rsvpDeadlineDate + "T12:00:00").toLocaleDateString("es-AR", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <>
      {/* Hero section — full screen */}
      <section className="relative min-h-screen flex flex-col">
        {/* Fondo negro base */}
        <div className="absolute inset-0 bg-black pointer-events-none" />
        {/* Foto de fondo — contain para ver la foto completa */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{ backgroundImage: `url('${settings.main_photo || "/photos/main/foto2.jpg"}')` }}
        />
        {/* Overlay oscuro para legibilidad */}
        <div className="absolute inset-0 bg-black/50 pointer-events-none" />

        <NavbarServer />

        {/* Contenido central */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-32">
          {/* Separador decorativo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-12 bg-wedding-gold" />
            <span className="text-wedding-gold text-sm uppercase tracking-[0.3em]">
              Nos casamos
            </span>
            <div className="h-px w-12 bg-wedding-gold" />
          </div>

          {/* Nombres */}
          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl text-white leading-tight mb-6">
            {bride_name || "Novia"}
            <span className="block text-wedding-gold text-3xl sm:text-4xl my-3">&amp;</span>
            {groom_name || "Novio"}
          </h1>

          {/* Fecha */}
          <p className="text-white/70 text-base sm:text-lg capitalize mb-12 tracking-wide">
            {dateFormatted}
          </p>

          {/* Countdown */}
          <div className="mb-12 w-full">
            <CountdownTimer targetDate={weddingDate} />
          </div>

        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* Tarjetas de eventos */}
      <EventCards events={events} />

      {/* Divisor */}
      <div className="bg-wedding-cream px-8">
        <div className="max-w-5xl mx-auto border-t border-gray-200" />
      </div>

      {/* Galería — 8 fotos, 4+4 */}
      {photos.length > 0 && (
        <section className="bg-wedding-cream py-16">
          {/* Header */}
          <div className="text-center mb-10 px-6">
            {/* Ícono cámara */}
            <div className="inline-block text-wedding-gold/70 mb-4">
              <svg viewBox="0 0 64 48" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-14 h-11 mx-auto">
                <rect x="4" y="14" width="56" height="30" rx="4" />
                <circle cx="32" cy="29" r="9" />
                <circle cx="32" cy="29" r="5" />
                <path d="M22 14l4-8h12l4 8" />
                <rect x="48" y="19" width="6" height="4" rx="1" />
                <circle cx="11" cy="20" r="2" />
              </svg>
            </div>
            <p className="text-xs uppercase tracking-[0.25em] text-wedding-gold mb-2">
              {galleryTitle}
            </p>
            <h2 className="font-display italic text-3xl sm:text-4xl text-wedding-dark">
              {gallerySubtitle}
            </h2>
          </div>

          {/* Grid fotos */}
          <div className="max-w-6xl mx-auto px-8 space-y-2">
            <div className="grid grid-cols-4 gap-2">
              {photos.slice(0, 4).map((photo, i) => (
                <div key={i} className="relative aspect-[4/5] overflow-hidden rounded-sm">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    sizes="(max-width: 768px) 25vw, 300px"
                  />
                </div>
              ))}
            </div>
            {photos.length > 4 && (
              <div className="grid grid-cols-4 gap-2">
                {photos.slice(4, 8).map((photo, i) => (
                  <div key={i} className="relative aspect-[4/5] overflow-hidden rounded-sm">
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      className="object-cover transition-transform duration-700 hover:scale-105"
                      sizes="(max-width: 768px) 25vw, 300px"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA — Confirmar asistencia */}
      <ConfirmarModal
        brideName={bride_name}
        groomName={groom_name}
        bgPhoto={settings.main_photo || "/photos/main/foto2.jpg"}
        rsvpText={rsvpText}
        rsvpDeadline={rsvpDeadlineFormatted}
        cbuArs={settings.cbu_ars}
        aliasArs={settings.alias_ars}
        holderArs={settings.holder_ars}
        cbuUsd={settings.cbu_usd}
        aliasUsd={settings.alias_usd}
        holderUsd={settings.holder_usd}
      />

      {/* Regalos */}
      <RegalosModal
        bgPhoto={settings.main_photo || "/photos/main/foto2.jpg"}
        giftsBody={settings.gifts_body}
        cbuArs={settings.cbu_ars}
        aliasArs={settings.alias_ars}
        holderArs={settings.holder_ars}
        cbuUsd={settings.cbu_usd}
        aliasUsd={settings.alias_usd}
        holderUsd={settings.holder_usd}
      />
    </>
  );
}
