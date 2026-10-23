import NavbarServer from "@/components/wedding/NavbarServer";
import CopyButton from "@/components/wedding/CopyButton";
import { getSettings } from "@/lib/settings";

export default async function RegalosPage() {
  const settings = await getSettings();
  const { cbu_ars, alias_ars, holder_ars, cbu_usd, alias_usd, holder_usd, gifts_title, gifts_body, gifts_footer } = settings;

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
            Con mucho amor
          </p>
          <h1 className="font-display text-4xl sm:text-5xl text-white">Regalos</h1>
        </div>
      </section>

      <section className="bg-wedding-cream py-16 px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Mensaje */}
          <div className="text-center space-y-3">
            <div className="text-4xl">🎁</div>
            {gifts_title && (
              <h2 className="font-display text-2xl text-wedding-dark">{gifts_title}</h2>
            )}
            {gifts_body && (
              <p className="text-muted-foreground leading-relaxed">{gifts_body}</p>
            )}
          </div>

          {/* Cards lado a lado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">

            {/* Pesos */}
            <div className="bg-white rounded-xl border border-wedding-gold/30 overflow-hidden shadow-sm">
              <div className="bg-wedding-dark px-5 py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-display text-white text-base">Caja de ahorro en Pesos</h3>
                  {holder_ars && <p className="text-white/60 text-xs mt-0.5">Titular: {holder_ars}</p>}
                </div>
                <span className="text-xl">🇦🇷</span>
              </div>
              <div className="p-5 space-y-4">
                {cbu_ars && (
                  <div className="space-y-1.5">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">CBU</p>
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-xs text-wedding-dark bg-muted px-3 py-2 rounded flex-1 break-all min-w-0">
                        {cbu_ars}
                      </code>
                      <CopyButton text={cbu_ars} label="CBU" />
                    </div>
                  </div>
                )}
                {alias_ars && (
                  <div className="space-y-1.5">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">Alias</p>
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-sm text-wedding-dark bg-muted px-3 py-2 rounded flex-1 min-w-0">
                        {alias_ars}
                      </code>
                      <CopyButton text={alias_ars} label="Alias" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* USD */}
            {(cbu_usd || alias_usd) && (
              <div className="bg-white rounded-xl border border-wedding-gold/30 overflow-hidden shadow-sm">
                <div className="bg-wedding-dark px-5 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-white text-base">Caja de ahorro en Dólares</h3>
                    {holder_usd && <p className="text-white/60 text-xs mt-0.5">Titular: {holder_usd}</p>}
                  </div>
                  <span className="text-xl">🇺🇸</span>
                </div>
                <div className="p-5 space-y-4">
                  {cbu_usd && (
                    <div className="space-y-1.5">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">CBU</p>
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-xs text-wedding-dark bg-muted px-3 py-2 rounded flex-1 break-all min-w-0">
                          {cbu_usd}
                        </code>
                        <CopyButton text={cbu_usd} label="CBU" />
                      </div>
                    </div>
                  )}
                  {alias_usd && (
                    <div className="space-y-1.5">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">Alias</p>
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-sm text-wedding-dark bg-muted px-3 py-2 rounded flex-1 min-w-0">
                          {alias_usd}
                        </code>
                        <CopyButton text={alias_usd} label="Alias" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {gifts_footer && (
            <p className="text-center text-sm text-muted-foreground">{gifts_footer}</p>
          )}
        </div>
      </section>
    </>
  );
}
