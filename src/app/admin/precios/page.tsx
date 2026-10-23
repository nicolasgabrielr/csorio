import { getPrices, getFixedCosts } from "@/actions/prices";
import PreciosForm from "./PreciosForm";

export const dynamic = "force-dynamic";

export default async function PreciosPage() {
  const [prices, fixedCosts] = await Promise.all([getPrices(), getFixedCosts()]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-wedding-dark">Precios</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Precios por acompañante y costos fijos del evento.
        </p>
      </div>
      <PreciosForm initialPrices={prices} initialFixedCosts={fixedCosts} />
    </div>
  );
}
