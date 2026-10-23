import { getSettings } from "@/lib/settings";

export default async function Footer() {
  const settings = await getSettings();
  const { bride_name, groom_name, wedding_date } = settings;

  const dateFormatted = wedding_date
    ? new Date(wedding_date + "T12:00:00").toLocaleDateString("es-AR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <footer className="bg-wedding-dark text-white/60 py-10 text-center">
      <p className="font-display text-2xl text-white mb-2">
        {bride_name || "Novia"} &amp; {groom_name || "Novio"}
      </p>
      {dateFormatted && (
        <p className="text-sm">{dateFormatted}</p>
      )}
      <p className="text-xs mt-4 text-white/30">
        Hecho con ❤️ por Nicolás
      </p>
    </footer>
  );
}
