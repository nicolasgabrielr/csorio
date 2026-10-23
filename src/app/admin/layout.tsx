import { signOut } from "@/lib/auth";
import Link from "next/link";

// La protección de rutas la maneja proxy.ts
// Este layout solo renderiza la UI compartida del panel

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Topbar */}
      <header className="bg-wedding-dark text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-display text-lg text-wedding-gold">
              Panel Admin
            </span>
            <nav className="hidden md:flex items-center gap-4 text-sm">
              <Link href="/admin/invitados" className="hover:text-wedding-gold transition-colors">
                Invitados
              </Link>
              <Link href="/admin/confirmados" className="hover:text-wedding-gold transition-colors">
                Confirmados
              </Link>
              <Link href="/admin/metricas" className="hover:text-wedding-gold transition-colors">
                Métricas
              </Link>
              <Link href="/admin/precios" className="hover:text-wedding-gold transition-colors">
                Precios
              </Link>
              <Link href="/admin/fotos" className="hover:text-wedding-gold transition-colors">
                Fotos
              </Link>
              <Link href="/admin/fotos-invitados" className="hover:text-wedding-gold transition-colors">
                Fotos invitados
              </Link>
              <Link href="/admin/configuracion" className="hover:text-wedding-gold transition-colors">
                Configuración
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs text-white/60 hover:text-white transition-colors"
              target="_blank"
            >
              Ver sitio →
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin/login" });
              }}
            >
              <button
                type="submit"
                className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded transition-colors"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
        {/* Mobile nav */}
        <nav className="md:hidden flex gap-4 px-4 pb-2 text-sm">
          <Link href="/admin/invitados" className="hover:text-wedding-gold transition-colors">
            Invitados
          </Link>
          <Link href="/admin/confirmados" className="hover:text-wedding-gold transition-colors">
            Confirmados
          </Link>
          <Link href="/admin/metricas" className="hover:text-wedding-gold transition-colors">
            Métricas
          </Link>
          <Link href="/admin/precios" className="hover:text-wedding-gold transition-colors">
            Precios
          </Link>
          <Link href="/admin/fotos" className="hover:text-wedding-gold transition-colors">
            Fotos
          </Link>
          <Link href="/admin/fotos-invitados" className="hover:text-wedding-gold transition-colors">
            Fotos inv.
          </Link>
          <Link href="/admin/configuracion" className="hover:text-wedding-gold transition-colors">
            Config
          </Link>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
