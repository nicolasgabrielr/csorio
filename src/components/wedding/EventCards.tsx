import Link from "next/link";
import type { EventItem } from "@/lib/settings";

function ChurchIcon() {
  return (
    <svg viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
      <line x1="28" y1="4" x2="28" y2="14" />
      <line x1="23" y1="8" x2="33" y2="8" />
      <path d="M22 14h12v8l-6-4-6 4V14Z" />
      <path d="M10 52V28l18-12 18 12v24" />
      <path d="M24 52v-10a4 4 0 0 1 8 0v10" />
      <rect x="13" y="32" width="6" height="8" rx="3" />
      <rect x="37" y="32" width="6" height="8" rx="3" />
    </svg>
  );
}

function CivilIcon() {
  return (
    <svg viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
      <circle cx="20" cy="28" r="7" />
      <circle cx="36" cy="28" r="7" />
      <path d="M27 28h2" />
    </svg>
  );
}

function PartyIcon() {
  return (
    <svg viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
      <path d="M14 8 L8 24 h12 Z" />
      <line x1="14" y1="24" x2="14" y2="36" />
      <line x1="9" y1="36" x2="19" y2="36" />
      <path d="M42 8 L36 24 h12 Z" />
      <line x1="42" y1="24" x2="42" y2="36" />
      <line x1="37" y1="36" x2="47" y2="36" />
      <line x1="20" y1="20" x2="36" y2="20" />
      <circle cx="26" cy="13" r="1" />
      <circle cx="30" cy="10" r="1" />
    </svg>
  );
}

/** "8 de octubre" → { day: "8", month: "OCTUBRE" } */
function parseDate(date: string): { day: string; month: string } | null {
  const parts = date.split(" de ");
  if (parts.length === 2) return { day: parts[0].trim(), month: parts[1].trim().toUpperCase() };
  return null;
}

/** "12:00 hs" → "12:00" */
function parseTime(time: string): string {
  return time.replace(/\s*hs\.?/i, "").trim();
}

function EventCard({ event, bordered }: { event: EventItem; bordered: boolean }) {
  const parsed = parseDate(event.date);
  const time = parseTime(event.time);
  const hasContent = event.venue || event.address || event.date || event.time;

  return (
    <div className={`flex flex-col items-center text-center px-6 py-10 ${bordered ? "border-r border-wedding-gold/20" : ""}`}>
      {/* Ícono */}
      <div className="text-wedding-gold/60 mb-4">
        {event.icon === "church" ? <ChurchIcon /> : event.icon === "civil" ? <CivilIcon /> : <PartyIcon />}
      </div>

      {/* Título */}
      <h3 className="font-display italic text-2xl text-wedding-dark mb-5 tracking-wide">
        {event.title}
      </h3>

      {/* Fecha + hora */}
      {hasContent && (
        <div className="flex items-start justify-center gap-5 mb-6">
          {parsed && (
            <div className="text-center">
              <p className="font-display text-3xl text-wedding-dark leading-none">{parsed.day}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{parsed.month}</p>
            </div>
          )}
          {!parsed && event.date && (
            <p className="text-sm text-muted-foreground">{event.date}</p>
          )}
          {time && (
            <div className="text-center">
              <p className="font-display text-3xl text-wedding-dark leading-none">{time}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Horas</p>
            </div>
          )}
        </div>
      )}

      {/* Separador */}
      {hasContent && <div className="w-10 h-px bg-wedding-gold/30 mb-5" />}

      {/* Lugar */}
      {event.venue && (
        <p className="text-sm font-semibold text-wedding-dark mb-1">{event.venue}</p>
      )}
      {event.address && (
        <p className="text-xs text-muted-foreground mb-5 leading-relaxed">{event.address}</p>
      )}

      {/* Link Maps */}
      {event.maps_url && (
        <Link
          href={event.maps_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-5 py-1.5 border border-wedding-gold/40 rounded-full text-[10px] uppercase tracking-widest text-wedding-dark hover:bg-wedding-gold hover:text-white hover:border-wedding-gold transition-all duration-200"
        >
          Cómo llegar
        </Link>
      )}
    </div>
  );
}

export default function EventCards({ events }: { events: EventItem[] }) {
  if (!events.length) return null;

  const cols =
    events.length === 1 ? "grid-cols-1" :
    events.length === 2 ? "grid-cols-2" :
    events.length === 3 ? "grid-cols-3" :
    "grid-cols-4";

  return (
    <section className="bg-wedding-cream py-8">
      <div className={`max-w-5xl mx-auto grid ${cols}`}>
        {events.map((event, i) => (
          <EventCard key={i} event={event} bordered={i < events.length - 1} />
        ))}
      </div>
    </section>
  );
}
