import { getMetrics } from "@/actions/confirmations";
import { getFixedCosts } from "@/actions/prices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

function StatRow({
  label,
  value,
  sublabel,
  valueClass = "text-wedding-dark",
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        {sublabel && <p className="text-xs text-muted-foreground/70 mt-0.5">{sublabel}</p>}
      </div>
      <p className={`text-lg font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}

export default async function MetricasPage() {
  const [m, fc] = await Promise.all([getMetrics(), getFixedCosts()]);

  const confirmationRate =
    m.totalGuests > 0 ? Math.round((m.confirmedGuests / m.totalGuests) * 100) : 0;

  const totalFixedCosts = fc.salon + fc.deco + fc.dj + fc.cotillon + fc.catering + fc.foto_video + fc.traje + fc.vestido;
  const totalCosts = totalFixedCosts + m.coupleCovers;
  const balance = m.totalRevenue - totalCosts;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-wedding-dark">Métricas</h1>
        <p className="text-sm text-muted-foreground mt-1">Resumen general del casamiento</p>
      </div>

      {/* Personas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-wedding-dark">Personas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          <StatRow
            label="Confirmadas"
            sublabel="Titulares + acompañantes ya confirmados"
            value={m.confirmedPeople}
            valueClass="text-green-600"
          />
          <StatRow
            label="Sin confirmar"
            sublabel="Titulares + lista cerrada de pendientes"
            value={m.pendingPeople}
            valueClass="text-orange-500"
          />
          <StatRow
            label="Total estimado"
            value={m.totalPeople}
            valueClass="text-wedding-dark text-xl"
          />
        </CardContent>
      </Card>

      {/* Desglose por categoría */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-wedding-dark">Desglose por categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: "Adultos",
                confirmed: m.confirmedAdults,
                pending: m.pendingAdults,
                total: m.totalAdults,
                color: "text-wedding-gold",
                bg: "bg-wedding-gold/10 border-wedding-gold/30",
              },
              {
                label: "Mayores de 12",
                confirmed: m.confirmedOver12,
                pending: m.pendingOver12,
                total: m.totalOver12,
                color: "text-orange-600",
                bg: "bg-orange-50 border-orange-200",
              },
              {
                label: "Menores de 12",
                confirmed: m.confirmedUnder12,
                pending: m.pendingUnder12,
                total: m.totalUnder12,
                color: "text-blue-600",
                bg: "bg-blue-50 border-blue-200",
              },
              {
                label: "Menores de 5",
                confirmed: m.confirmedUnder5,
                pending: m.pendingUnder5,
                total: m.totalUnder5,
                color: "text-purple-600",
                bg: "bg-purple-50 border-purple-200",
              },
            ].map(cat => (
              <div key={cat.label} className={`rounded-lg border p-3 ${cat.bg}`}>
                <p className={`text-xs font-semibold uppercase tracking-wide ${cat.color}`}>{cat.label}</p>
                <p className={`text-3xl font-bold mt-1 ${cat.color}`}>{cat.total}</p>
                <div className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                  <p>✓ {cat.confirmed} confirmados</p>
                  <p>· {cat.pending} pendientes</p>
                </div>
              </div>
            ))}
          </div>
          {m.coupleCovers > 0 && (
            <div className="mt-3 rounded-lg border border-pink-200 bg-pink-50/50 px-3 py-2 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-pink-700">💑 Los novios absorben</p>
                <p className="text-lg font-bold text-pink-600">${m.coupleCovers.toLocaleString("es-AR")}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Gap entre precio estándar y precio cobrado a cada persona
                {m.coupleCoverCount > 0 && <> · <span className="font-medium">{m.coupleCoverCount} {m.coupleCoverCount === 1 ? "persona" : "personas"} sin cargo</span></>}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invitaciones */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-wedding-dark">Invitaciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          <StatRow
            label="Confirmaron"
            value={`${m.confirmedGuests} de ${m.totalGuests}`}
            valueClass="text-green-600"
          />
          <StatRow
            label="Pendientes"
            value={m.pendingGuests}
            valueClass="text-orange-500"
          />
          <StatRow
            label="Total personas"
            sublabel="Titulares + lista cerrada (sin acomp. adicionales)"
            value={m.totalPeople}
            valueClass="text-wedding-dark"
          />
          {/* Barra de progreso */}
          <div className="pt-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-muted rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full bg-wedding-gold rounded-full transition-all"
                  style={{ width: `${confirmationRate}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-wedding-dark w-10 text-right">
                {confirmationRate}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Titulares — desglose por precio */}
      {m.adultStdPrice > 0 && m.guestPricing.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-wedding-dark">Adultos — costo real</CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            {/* Precios de referencia */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3 pb-3 border-b border-border/50">
              <p className="text-xs text-muted-foreground">
                Adulto: <span className="font-semibold text-wedding-dark">${m.adultStdPrice.toLocaleString("es-AR")}</span>
              </p>
              {m.over12StdPrice > 0 && (
                <p className="text-xs text-muted-foreground">
                  Mayor de 12: <span className="font-semibold text-wedding-dark">${m.over12StdPrice.toLocaleString("es-AR")}</span>
                </p>
              )}
              {m.under12StdPrice > 0 && (
                <p className="text-xs text-muted-foreground">
                  Menor de 12: <span className="font-semibold text-wedding-dark">${m.under12StdPrice.toLocaleString("es-AR")}</span>
                </p>
              )}
            </div>
            {/* Lista individual */}
            <div className="max-h-96 overflow-y-auto -mx-6 px-6">
              {m.guestPricing.map((g, i) => {
                const stdPrice = g.type === "adult" ? m.adultStdPrice : g.type === "over12" ? m.over12StdPrice : m.under12StdPrice;
                const subsidy = Math.max(0, stdPrice - g.main_cost);
                return (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0 gap-3">
                    <p className="text-sm text-wedding-dark truncate">{g.name}</p>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-green-600">
                        {g.main_cost === 0 ? <span className="text-pink-500">Sin cargo</span> : `$${g.main_cost.toLocaleString("es-AR")}`}
                      </p>
                      {subsidy > 0 && (
                        <p className="text-xs text-orange-500">−${subsidy.toLocaleString("es-AR")}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Totales */}
            <div className="pt-3 mt-1 flex items-center justify-between gap-4 border-t border-border/50">
              <div>
                <p className="text-xs text-muted-foreground">Total recaudado</p>
                <p className="text-xs text-muted-foreground mt-0.5">Subsidio total de novios</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-green-600">
                  ${m.guestPricing.reduce((s, g) => s + g.main_cost, 0).toLocaleString("es-AR")}
                </p>
                <p className="text-sm font-bold text-pink-600">
                  −${m.guestPricing.reduce((s, g) => {
                    const std = g.type === "adult" ? m.adultStdPrice : g.type === "over12" ? m.over12StdPrice : m.under12StdPrice;
                    return s + Math.max(0, std - g.main_cost);
                  }, 0).toLocaleString("es-AR")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recaudación */}
      <Card className="border-wedding-gold/30 bg-wedding-cream/50">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-wedding-dark">Recaudación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          <StatRow
            label="Cobrado"
            sublabel="Confirmados que ya pagaron"
            value={`$${m.paidRevenue.toLocaleString("es-AR")}`}
            valueClass="text-green-600"
          />
          {m.unpaidRevenue > 0 && (
            <StatRow
              label="Confirmado, sin pagar"
              sublabel="Confirmaron pero aún no pagaron"
              value={`$${m.unpaidRevenue.toLocaleString("es-AR")}`}
              valueClass="text-orange-500"
            />
          )}
          {m.pendingFixedRevenue > 0 && (
            <StatRow
              label="Por confirmar"
              sublabel="Titular + lista cerrada de pendientes"
              value={`$${m.pendingFixedRevenue.toLocaleString("es-AR")}`}
              valueClass="text-muted-foreground"
            />
          )}
          <div className="pt-2 pb-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-wedding-dark">Total estimado</p>
              <p className="text-3xl font-bold text-wedding-gold">
                ${m.totalRevenue.toLocaleString("es-AR")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Costos del evento */}
      {(totalFixedCosts > 0 || m.coupleCovers > 0) && (
        <Card className="border-red-200 bg-red-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-wedding-dark">Costos del evento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            {fc.salon > 0 && (
              <StatRow label="Salón" value={`$${fc.salon.toLocaleString("es-AR")}`} valueClass="text-red-600" />
            )}
            {fc.deco > 0 && (
              <StatRow label="Decoración" value={`$${fc.deco.toLocaleString("es-AR")}`} valueClass="text-red-600" />
            )}
            {fc.dj > 0 && (
              <StatRow label="DJ" value={`$${fc.dj.toLocaleString("es-AR")}`} valueClass="text-red-600" />
            )}
            {fc.cotillon > 0 && (
              <StatRow label="Cotillón" value={`$${fc.cotillon.toLocaleString("es-AR")}`} valueClass="text-red-600" />
            )}
            {fc.catering > 0 && (
              <StatRow label="Catering" value={`$${fc.catering.toLocaleString("es-AR")}`} valueClass="text-red-600" />
            )}
            {fc.foto_video > 0 && (
              <StatRow label="Fotografía y Video" value={`$${fc.foto_video.toLocaleString("es-AR")}`} valueClass="text-red-600" />
            )}
            {fc.traje > 0 && (
              <StatRow label="Traje Novio" value={`$${fc.traje.toLocaleString("es-AR")}`} valueClass="text-red-600" />
            )}
            {fc.vestido > 0 && (
              <StatRow label="Vestido Novia" value={`$${fc.vestido.toLocaleString("es-AR")}`} valueClass="text-red-600" />
            )}
            {m.coupleCovers > 0 && (
              <StatRow
                label="Los novios absorben 💑"
                sublabel="Gap entre precio estándar y precio cobrado a cada persona"
                value={`$${m.coupleCovers.toLocaleString("es-AR")}`}
                valueClass="text-pink-600"
              />
            )}
            <div className="pt-2 pb-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-wedding-dark">Total costos</p>
                <p className="text-2xl font-bold text-red-600">
                  ${(totalFixedCosts + m.coupleCovers).toLocaleString("es-AR")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Balance */}
      {totalCosts > 0 && (
        <Card className={balance >= 0 ? "border-green-200 bg-green-50/30" : "border-red-300 bg-red-50/50"}>
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-wedding-dark">Balance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            <StatRow
              label="Recaudación estimada"
              value={`$${m.totalRevenue.toLocaleString("es-AR")}`}
              valueClass="text-green-600"
            />
            <StatRow
              label="Total costos"
              value={`−$${totalCosts.toLocaleString("es-AR")}`}
              valueClass="text-red-600"
            />
            <div className="pt-3 pb-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-wedding-dark">
                  {balance >= 0 ? "Ganancia neta estimada" : "Déficit estimado"}
                </p>
                <p className={`text-3xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {balance >= 0 ? "" : "−"}${Math.abs(balance).toLocaleString("es-AR")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
